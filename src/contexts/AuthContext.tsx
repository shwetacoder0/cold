import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { generateUserDetails } from '../lib/gemini'

interface UserTokens {
  tokens: number
  plan: 'free' | 'basic' | 'pro'
}

interface UserProfile {
  input_text: string
  user_details: string
  updated_at: string
}

interface UserDocument {
  id: string
  document_name: string
  document_type: string
  file_size: number
  created_at: string
}

interface CreateProfileData {
  inputText: string
  userDetails: string
  documents: Array<{
    name: string
    type: string
    size: number
  }>
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userTokens: UserTokens | null
  userProfile: UserProfile | null
  needsOnboarding: boolean
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  useToken: () => Promise<boolean>
  purchaseTokens: (plan: 'basic' | 'pro') => Promise<{ error: Error | null }>
  createUserProfile: (data: CreateProfileData) => Promise<{ error: Error | null }>
  getUserProfile: () => Promise<UserProfile | null>
  updateUserProfile: (inputText: string) => Promise<{ error: Error | null }>
  getUserDocuments: () => Promise<UserDocument[] | null>
  deleteUserDocument: (documentId: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userTokens, setUserTokens] = useState<UserTokens | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchUserTokens = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('tokens, plan')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user tokens:', error)
        return
      }

      if (data) {
        setUserTokens(data)
      } else {
        // Create initial free tier tokens for new user
        const { data: newTokens, error: insertError } = await supabase
          .from('user_tokens')
          .insert([
            { user_id: userId, tokens: 5, plan: 'free' }
          ])
          .select()
          .single()

        if (insertError) {
          console.error('Error creating user tokens:', insertError)
        } else {
          setUserTokens(newTokens)
        }
      }
    } catch (error) {
      console.error('Error in fetchUserTokens:', error)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('input_text, user_details, updated_at')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error)
        return
      }

      if (data) {
        setUserProfile(data)
        setNeedsOnboarding(false)
      } else {
        setUserProfile(null)
        setNeedsOnboarding(true)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserTokens(session.user.id)
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle OAuth callback
      if (event === 'SIGNED_IN' && session) {
        // Clean up the URL hash after successful OAuth
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserTokens(session.user.id)
        fetchUserProfile(session.user.id)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setUserTokens(null)
    setUserProfile(null)
    setNeedsOnboarding(false)
    return { error }
  }

  const useToken = async (): Promise<boolean> => {
    if (!user || !userTokens) return false
    
    if (userTokens.tokens <= 0) return false

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .update({ tokens: userTokens.tokens - 1 })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error using token:', error)
        return false
      }

      setUserTokens(data)
      return true
    } catch (error) {
      console.error('Error in useToken:', error)
      return false
    }
  }

  const purchaseTokens = async (plan: 'basic' | 'pro'): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') }

    const tokenAmounts = { basic: 30, pro: 250 }
    const newTokenCount = tokenAmounts[plan]

    try {
      // In a real application, you would verify the PayPal payment here
      // For now, we'll simulate a successful purchase
      const { data, error } = await supabase
        .from('user_tokens')
        .update({ 
          tokens: newTokenCount,
          plan: plan
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        return { error: new Error(error.message) }
      }

      setUserTokens(data)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const createUserProfile = async (data: CreateProfileData): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      // Insert user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: user.id,
            input_text: data.inputText,
            user_details: data.userDetails
          }
        ])

      if (profileError) {
        return { error: new Error(profileError.message) }
      }

      // Insert documents
      if (data.documents.length > 0) {
        const documentInserts = data.documents.map(doc => ({
          user_id: user.id,
          document_name: doc.name,
          document_type: doc.type,
          file_size: doc.size
        }))

        const { error: docsError } = await supabase
          .from('user_documents')
          .insert(documentInserts)

        if (docsError) {
          console.error('Error inserting documents:', docsError)
          // Don't fail the whole operation for document errors
        }
      }

      // Refresh profile data
      await fetchUserProfile(user.id)
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const getUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('input_text, user_details, updated_at')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProfile:', error)
      return null
    }
  }

  const updateUserProfile = async (inputText: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      // Generate new user details
      const userDetails = await generateUserDetails(inputText, '')

      const { error } = await supabase
        .from('user_profiles')
        .update({
          input_text: inputText,
          user_details: userDetails,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      // Refresh profile data
      await fetchUserProfile(user.id)
      
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const getUserDocuments = async (): Promise<UserDocument[] | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('id, document_name, document_type, file_size, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user documents:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserDocuments:', error)
      return null
    }
  }

  const deleteUserDocument = async (documentId: string): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      const { error } = await supabase
        .from('user_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    session,
    userTokens,
    userProfile,
    needsOnboarding,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    useToken,
    purchaseTokens,
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    getUserDocuments,
    deleteUserDocument,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}