import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInFormData = z.infer<typeof signInSchema>
type SignUpFormData = z.infer<typeof signUpSchema>

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [showEmailAuth, setShowEmailAuth] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    
    if (error) {
      signInForm.setError('root', { message: error.message })
    } else {
      onClose()
      signInForm.reset()
    }
    setLoading(false)
  }

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true)
    const { error } = await signUp(data.email, data.password)
    
    if (error) {
      signUpForm.setError('root', { message: error.message })
    } else {
      // Show success message or switch to sign in
      setMode('signin')
      signUpForm.reset()
      signInForm.setValue('email', data.email)
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    
    if (error) {
      signInForm.setError('root', { message: error.message })
    }
    // Note: For OAuth, the user will be redirected, so we don't close the modal here
    setGoogleLoading(false)
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    signInForm.reset()
    signUpForm.reset()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-2xl border-2 border-amber-200 w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold text-amber-900 font-work">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-amber-600 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Google Authentication */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center space-x-3 py-4 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-work font-bold text-lg"
            >
              <Chrome className="w-6 h-6" />
              <span>
                {googleLoading ? 'Connecting...' : `${mode === 'signin' ? 'Sign In' : 'Sign Up'} with Google`}
              </span>
            </button>

            {/* Alternative Email/Password Option */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowEmailAuth(!showEmailAuth)}
                className="text-sm text-amber-700 hover:text-amber-900 font-medium underline"
              >
                {showEmailAuth ? 'Hide email option' : 'Use email instead'}
              </button>
            </div>

            {showEmailAuth && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-amber-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gradient-to-br from-white to-amber-50 text-amber-700 font-medium">
                      Or use email
                    </span>
                  </div>
                </div>

                {mode === 'signin' ? (
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2 font-noto">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <input
                          {...signInForm.register('email')}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 text-amber-900 font-roboto"
                          placeholder="Enter your email"
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {signInForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2 font-noto">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <input
                          {...signInForm.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 text-amber-900 font-roboto"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-900"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {signInForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {signInForm.formState.errors.root && (
                      <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                        {signInForm.formState.errors.root.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-work"
                    >
                      {loading ? 'Signing In...' : 'Sign In with Email'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2 font-noto">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <input
                          {...signUpForm.register('email')}
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 text-amber-900 font-roboto"
                          placeholder="Enter your email"
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2 font-noto">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <input
                          {...signUpForm.register('password')}
                          type={showPassword ? 'text' : 'password'}
                          className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 text-amber-900 font-roboto"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-900"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-amber-900 mb-2 font-noto">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <input
                          {...signUpForm.register('confirmPassword')}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full pl-10 pr-12 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white/80 text-amber-900 font-roboto"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-900"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {signUpForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {signUpForm.formState.errors.root && (
                      <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-200">
                        {signUpForm.formState.errors.root.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white py-3 rounded-xl font-bold hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 font-work"
                    >
                      {loading ? 'Creating Account...' : 'Create Account with Email'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-amber-700 font-noto">
              {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={switchMode}
                className="ml-1 font-bold text-amber-900 hover:text-orange-600 transition-colors"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal