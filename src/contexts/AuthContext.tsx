import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { generateUserDetails } from '../lib/gemini'
import { handleSubscriptionEvent } from '../lib/lemonsqueezy';

interface UserTokens {
  tokens: number
  monthly_tokens: number
  plan: 'free' | 'basic' | 'pro'
  subscription_start: string
  subscription_end: string
  tokens_reset_date: string
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
  processSubscriptionWebhook: (eventData: any) => Promise<{ error: Error | null }>;
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
        .select('tokens, monthly_tokens, plan, subscription_start, subscription_end, tokens_reset_date')
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
        const now = new Date()
        const monthFromNow = new Date(now)
        monthFromNow.setMonth(monthFromNow.getMonth() + 1)

        const { data: newTokens, error: insertError } = await supabase
          .from('user_tokens')
          .insert([
            {
              user_id: userId,
              tokens: 5,
              monthly_tokens: 5,
              plan: 'free',
              subscription_start: now.toISOString(),
              subscription_end: monthFromNow.toISOString(),
              tokens_reset_date: monthFromNow.toISOString()
            }
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

  const purchaseTokens = async (plan: 'basic' | 'pro'): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') }

    const tokenAmounts = { basic: 30, pro: 250 }
    const newTokenCount = tokenAmounts[plan]
    const now = new Date()
    const subscriptionEnd = new Date(now)
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)
    const tokensResetDate = new Date(now)
    tokensResetDate.setMonth(tokensResetDate.getMonth() + 1)

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .update({
          tokens: newTokenCount,
          monthly_tokens: newTokenCount,
          plan: plan,
          subscription_start: now.toISOString(),
          subscription_end: subscriptionEnd.toISOString(),
          tokens_reset_date: tokensResetDate.toISOString()
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

  const useToken = async (): Promise<boolean> => {
    if (!user || !userTokens) return false

    if (userTokens.tokens <= 0) return false

    // Check if subscription has expired
    const now = new Date()
    const subscriptionEnd = new Date(userTokens.subscription_end)
    if (now > subscriptionEnd) {
      // Reset to free plan
      const { error } = await supabase
        .from('user_tokens')
        .update({
          tokens: 5,
          monthly_tokens: 5,
          plan: 'free',
          subscription_start: now.toISOString(),
          subscription_end: new Date(now.setMonth(now.getMonth() + 1)).toISOString(),
          tokens_reset_date: new Date(now.setMonth(now.getMonth() + 1)).toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error resetting to free plan:', error)
        return false
      }
      return false
    }

    // Check if tokens need to be reset
    const tokensResetDate = new Date(userTokens.tokens_reset_date)
    if (now > tokensResetDate) {
      const nextResetDate = new Date(now)
      nextResetDate.setMonth(nextResetDate.getMonth() + 1)

      const { data, error } = await supabase
        .from('user_tokens')
        .update({
          tokens: userTokens.monthly_tokens,
          tokens_reset_date: nextResetDate.toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error resetting tokens:', error)
        return false
      }

      setUserTokens(data)
      return true
    }

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
      // Get existing documents for context
      const documents = await getUserDocuments()
      let documentContext = ''

      if (documents && documents.length > 0) {
        // For existing documents, we'll just use their names as context
        // since we don't re-extract text on profile updates
        documentContext = documents.map(doc => `Document: ${doc.document_name}`).join('\n')
      }

      // Combine input text with document context
      let combinedText = inputText.trim()
      if (documentContext) {
        combinedText += '\n\n' + documentContext
      }

      // Generate new user details
      const userDetails = await generateUserDetails(combinedText, '')

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

  // Add a method to process Lemon Squeezy webhooks
  const processSubscriptionWebhook = async (eventData: any): Promise<{ error: Error | null }> => {
    if (!eventData) return { error: new Error('Invalid webhook data') };

    try {
      // Process the webhook event
      const subscription = handleSubscriptionEvent(eventData);

      if (!subscription || !subscription.userId) {
        return { error: new Error('Invalid subscription data') };
      }

      const { userId, plan, status } = subscription;

      // If subscription is active, update the user's plan
      if (status === 'active') {
        const tokenAmounts = { basic: 30, pro: 250, free: 5 };
        const newTokenCount = tokenAmounts[plan as keyof typeof tokenAmounts];
        const now = new Date();
        const subscriptionEnd = new Date(now);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        const tokensResetDate = new Date(now);
        tokensResetDate.setMonth(tokensResetDate.getMonth() + 1);

        const { error } = await supabase
          .from('user_tokens')
          .update({
            tokens: newTokenCount,
            monthly_tokens: newTokenCount,
            plan: plan,
            subscription_start: now.toISOString(),
            subscription_end: subscriptionEnd.toISOString(),
            tokens_reset_date: tokensResetDate.toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          return { error: new Error(error.message) };
        }
      }
      // If subscription is cancelled, downgrade to free
      else if (status === 'cancelled') {
        const now = new Date();
        const monthFromNow = new Date(now);
        monthFromNow.setMonth(monthFromNow.getMonth() + 1);

        const { error } = await supabase
          .from('user_tokens')
          .update({
            tokens: 5,
            monthly_tokens: 5,
            plan: 'free',
            subscription_start: now.toISOString(),
            subscription_end: monthFromNow.toISOString(),
            tokens_reset_date: monthFromNow.toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          return { error: new Error(error.message) };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

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
    processSubscriptionWebhook
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
