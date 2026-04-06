import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, X, Lock, CheckCircle2 } from 'lucide-react'
import { API_URL } from '../config/apiConfig'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: email, 2: code, 3: password
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const handleRequestReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send reset code')
        setLoading(false)
        return
      }

      setResetToken(data.token)
      setStep(2) // Move to code verification step
      console.log('✅ Reset code sent to:', email)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, code })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid code')
        setLoading(false)
        return
      }

      setStep(3) // Move to password reset step
      console.log('✅ Code verified, ready to reset password')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Verify code error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to reset password')
        setLoading(false)
        return
      }

      setStep(4) // Success step
      console.log('✅ Password reset successfully')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      {/* Gradient Overlay */}
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
          onClick={() => window.location.hash = '#/login'}
          className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <X size={16} />
          Back to Login
        </motion.button>

        <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-4"
            >
              <span className="text-2xl font-bold text-white">PA</span>
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {step === 1 && 'Enter your email to get started'}
              {step === 2 && 'Check your email for the reset code'}
              {step === 3 && 'Create your new password'}
              {step === 4 && 'Password reset complete!'}
            </p>

            {/* Progress Indicator */}
            <div className="mt-4 flex justify-center gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i <= step ? 'bg-blue-600 w-6' : 'bg-gray-300 dark:bg-gray-600 w-2'
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 4 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20">
                <div className="flex justify-center mb-3">
                  <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="font-medium text-green-700 dark:text-green-400 mb-1">Password Reset Successful!</p>
                <p className="text-xs text-green-600 dark:text-green-300">You can now login with your new password.</p>
              </div>
              <button
                onClick={() => window.location.hash = '#/login'}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all cursor-pointer"
              >
                Back to Login
              </button>
            </motion.div>
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Step 1: Email */}
              {step === 1 && (
                <form onSubmit={handleRequestReset} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-3.5 text-blue-600" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="boss@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : (
                      <>
                        Send Reset Code
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Step 2: Code Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Enter the 6-digit code sent to {email}</p>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all text-center font-mono text-lg tracking-widest"
                      maxLength="6"
                      required
                    />
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-full mt-6 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : (
                      <>
                        Verify Code
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3.5 text-blue-600" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 6 characters</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-3.5 text-blue-600" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Resetting...' : (
                      <>
                        Reset Password
                        <ArrowRight size={18} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => window.location.hash = '#/login'}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer font-medium"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
