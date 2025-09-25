import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Navigation } from '../Navigation';
import { Route } from '../Router';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Chrome,
  Github,
  UserCheck,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface AuthPageProps {
  onNavigate: (route: Route) => void;
}

type AuthMode = 'signin' | 'signup' | 'reset';

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate }) => {
  const { signIn, signUp, signInWithGoogle, signInWithGithub, signInAsGuest, resetPassword, isLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (mode === 'signup') {
        if (!formData.displayName) {
          newErrors.displayName = 'Full name is required';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      switch (mode) {
        case 'signin':
          await signIn(formData.email, formData.password);
          toast.success('Welcome back!');
          onNavigate('dashboard');
          break;
        case 'signup':
          await signUp(formData.email, formData.password, formData.displayName);
          toast.success('Account created successfully!');
          onNavigate('dashboard');
          break;
        case 'reset':
          await resetPassword(formData.email);
          toast.success('Password reset email sent!');
          setMode('signin');
          break;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle();
        toast.success('Signed in with Google!');
      } else {
        await signInWithGithub();
        toast.success('Signed in with GitHub!');
      }
      onNavigate('dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Social sign-in failed');
    }
  };

  const handleGuestMode = async () => {
    try {
      await signInAsGuest();
      toast.success('Welcome! You\'re using guest mode with limited features.');
      onNavigate('analysis');
    } catch (error) {
      toast.error('Failed to continue as guest');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen">
      <Navigation currentRoute="auth" onNavigate={onNavigate} />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1579801874037-f28c38c7edbf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luJTIwaGVhbHRoJTIwbWVkaWNhbCUyMGRpYWdub3Npc3xlbnwxfHx8fDE3NTg3NzYwODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Medical background"
            className="w-full h-full object-cover opacity-5"
          />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-2">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                >
                  <User className="w-8 h-8 text-white" />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Reset Password'}
                </CardTitle>
                
                <p className="text-gray-600 mt-2">
                  {mode === 'signin' && 'Sign in to access your health dashboard'}
                  {mode === 'signup' && 'Join thousands using AI-powered health screening'}
                  {mode === 'reset' && 'Enter your email to receive reset instructions'}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.form
                    key={mode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {mode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="displayName"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.displayName}
                            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                            className="pl-10 bg-white/50 border-white/20"
                            disabled={isLoading}
                          />
                        </div>
                        {errors.displayName && (
                          <p className="text-sm text-red-600 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.displayName}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="pl-10 bg-white/50 border-white/20"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {mode !== 'reset' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              value={formData.password}
                              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                              className="pl-10 pr-10 bg-white/50 border-white/20"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-red-600 flex items-center">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {errors.password}
                            </p>
                          )}
                        </div>

                        {mode === 'signup' && (
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="pl-10 bg-white/50 border-white/20"
                                disabled={isLoading}
                              />
                            </div>
                            {errors.confirmPassword && (
                              <p className="text-sm text-red-600 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <>
                          {mode === 'signin' && 'Sign In'}
                          {mode === 'signup' && 'Create Account'}
                          {mode === 'reset' && 'Send Reset Email'}
                        </>
                      )}
                    </Button>
                  </motion.form>
                </AnimatePresence>

                {mode !== 'reset' && (
                  <>
                    <div className="relative">
                      <Separator />
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-500">
                        or continue with
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleSocialAuth('google')}
                        disabled={isLoading}
                        className="bg-white/50 border-white/20 hover:bg-white/70"
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialAuth('github')}
                        disabled={isLoading}
                        className="bg-white/50 border-white/20 hover:bg-white/70"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    </div>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={handleGuestMode}
                        disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Continue as Guest
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Limited features • Results not saved
                      </p>
                    </div>
                  </>
                )}

                <div className="text-center space-y-2">
                  {mode === 'signin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => switchMode('reset')}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot your password?
                      </button>
                      <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('signup')}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                        >
                          Sign up
                        </button>
                      </p>
                    </>
                  )}

                  {mode === 'signup' && (
                    <p className="text-sm text-gray-600">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  )}

                  {mode === 'reset' && (
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back to sign in
                    </button>
                  )}
                </div>

                {mode === 'signup' && (
                  <Alert className="bg-blue-50/50 border-blue-200/50">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      By creating an account, you agree to our Terms of Service and Privacy Policy. 
                      This tool is for informational purposes only and is not a medical diagnosis.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};