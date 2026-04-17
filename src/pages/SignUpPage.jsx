import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, AlertCircle, X, Check, CheckCircle } from 'lucide-react'
import { API_URL } from '../config/apiConfig'
import { useAuth } from '../context/AuthContext'

export default function SignUpPage({ onSuccess }) {
  const { login } = useAuth()
  const [step, setStep] = useState(1) // 1: signup form, 2: email verification
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [verificationToken, setVerificationToken] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Name is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          setError(data.error || 'Sign up failed')
        } else {
          setError('Server error. Please check backend connection.')
        }
        return
      }

      const data = await response.json()

      if (data.requiresEmailVerification) {
        // Move to email verification step
        setVerificationToken(data.verificationToken)
        setStep(2)
        console.log('✅ Registration successful, waiting for email verification')
      } else {
        // Old flow - no email verification
        login(data.token, data.user)
        onSuccess && onSuccess(data)
        setTimeout(() => {
          window.location.hash = '#/'
        }, 300)
      }
    } catch (err) {
      setError('Connection error. Backend may not be running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: verificationToken, code: verificationCode })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Verification failed')
        return
      }

      const data = await response.json()
      login(data.token, data.user)
      onSuccess && onSuccess(data)
      
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 300)
    } catch (err) {
      setError('Verification error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: verificationToken })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to resend code')
        return
      }

      // Start cooldown timer
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setError('Error resending verification code')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const strengthTexts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500']

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Gradient Overlay Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => window.location.hash = '#/'}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <X size={16} />
          Back to Home
        </motion.button>

        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4"
            >
              <span className="text-2xl font-bold text-white">PA</span>
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {step === 1 ? 'Create Account' : 'Verify Email'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1 ? 'Join your personal assistant today' : 'Enter the code sent to your email'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Step 1: Signup Form */}
          {step === 1 ? (
            <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3.5 text-blue-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all text-base"
                  required
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3.5 text-blue-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="boss@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all text-base"
                  required
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-blue-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Strength: <span className="text-gray-900 dark:text-white font-medium">{strengthTexts[passwordStrength]}</span>
                  </p>
                  
                  {/* Password Requirements */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-lg border border-gray-200 dark:border-gray-600 space-y-1">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Password requirements:</p>
                    <div className="flex items-center gap-2">
                      {password.length >= 6 ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-500" />
                      )}
                      <span className={`text-xs ${password.length >= 6 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        At least 6 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {password.length >= 8 ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-500" />
                      )}
                      <span className={`text-xs ${password.length >= 8 ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        At least 8 characters (recommended)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[A-Z]/.test(password) ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-500" />
                      )}
                      <span className={`text-xs ${/[A-Z]/.test(password) ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        One uppercase letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[0-9]/.test(password) ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-500" />
                      )}
                      <span className={`text-xs ${/[0-9]/.test(password) ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        One number
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/[^A-Za-z0-9]/.test(password) ? (
                        <Check size={14} className="text-green-600" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-400 dark:border-gray-500" />
                      )}
                      <span className={`text-xs ${/[^A-Za-z0-9]/.test(password) ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        One special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-blue-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all text-base"
                  required
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? 'Creating account...' : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>
          ) : (
            /* Step 2: Email Verification Form */
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              {/* Verification Code Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all text-base tracking-widest text-center"
                    maxLength="6"
                    required
                  />
                </div>
              </motion.div>

              {/* Verification Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-sm"
              >
                <p>We've sent a verification code to:</p>
                <p className="font-semibold mt-1">{email}</p>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base"
              >
                {loading ? 'Verifying...' : (
                  <>
                    Verify Email
                    <CheckCircle size={18} />
                  </>
                )}
              </motion.button>

              {/* Resend Code Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                type="button"
                onClick={handleResendCode}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
              </motion.button>

              {/* Back Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                type="button"
                onClick={() => {
                  setStep(1);
                  setVerificationCode('');
                  setError('');
                }}
                className="w-full py-2 px-4 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm"
              >
                Back to sign up
              </motion.button>
            </form>
          )}

          {/* Divider - Only for Step 1 */}
          {step === 1 && (
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-500">Already have an account?</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}

          {/* Login Link - Only for Step 1 */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-sm text-gray-600"
            >
              <button
                type="button"
                onClick={() => window.location.hash = '#/login'}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors cursor-pointer"
              >
                Sign in instead
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
