'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called. Preventing default form submission.');
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (isSignUp) {
      handleSignUp();
    } else {
      console.log('Calling handleSignIn for login.');
      handleSignIn();
    }
  };

  const handleSignUp = async () => {
    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const supabase = createClient();

      console.log('🆕 Creating new account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('❌ Signup error:', authError);
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      console.log('✅ Account created');
      console.log('Auth data:', { user: authData.user?.id, hasSession: !!authData.session });

      if (authData.user && authData.session) {
        console.log('📝 Creating profile and affiliate...');

        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile-and-affiliate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`,
            },
            body: JSON.stringify({
              user_id: authData.user.id,
              email: authData.user.email
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Profile creation failed:', response.status, errorText);
            setError('Account created but profile setup failed. Please try logging in again.');
            setIsLoading(false);
            return;
          }

          const result = await response.json();
          console.log('✅ Profile and affiliate created successfully:', result);
        } catch (err) {
          console.error('❌ Profile creation error:', err);
          setError('Account created but profile setup failed. Please try logging in again.');
          setIsLoading(false);
          return;
        }

        setSuccessMessage('Account created successfully! Redirecting...');
        console.log('🚀 Redirecting to dashboard');

        setTimeout(() => {
          console.log('🚀 Executing navigation to dashboard');
          setIsLoading(false);
          window.location.href = '/dashboard';
        }, 800);
      } else if (authData.user && !authData.session) {
        console.log('⚠️ User created but no session - email confirmation required');
        setSuccessMessage('Account created! Please check your email to verify your account before logging in.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('🔐 Attempting sign-in with:', formData.email);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('❌ Login failed:', error.message);

        if (error.message.includes('Invalid login credentials')) {
          setError('The email or password you entered is incorrect. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.');
        } else {
          setError(error.message);
        }

        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Login failed. No user data returned.');
        setIsLoading(false);
        return;
      }

      console.log('✅ Login successful, user ID:', data.user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!profile || !affiliate) {
        console.log('📝 Profile or affiliate missing, creating...');

        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user-profile-and-affiliate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              user_id: data.user.id,
              email: data.user.email
            }),
          });

          if (!response.ok) {
            console.warn('⚠️ Edge Function failed, user can still login');
          } else {
            console.log('✅ Profile and affiliate created');
          }
        } catch (err) {
          console.warn('⚠️ Could not create profile, user can still login:', err);
        }
      }

      setSuccessMessage('Login successful! Redirecting...');
      console.log('🚀 Redirecting to dashboard');

      setTimeout(() => {
        console.log('🚀 Executing navigation to dashboard');
        setIsLoading(false);
        window.location.href = '/dashboard';
      }, 800);
    } catch (error) {
      console.error('❌ Sign-in error:', error);
      setError('An unexpected error occurred. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setSuccessMessage('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
  };


  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">I AM +</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-1">COACHING & TRAINING SYSTEMS</p>
            </div>
          </div>
        </div>

        {/* Toggle Text */}
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-brand-cyan hover:text-brand-cyan/80 font-medium transition-colors duration-200"
            >
              {isSignUp ? "Log In" : "Sign up"}
            </button>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
            </div>
          )}

          <div>
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Log In')}
          </Button>

          {!isSignUp && (
            <div className="text-center">
              <button className="text-brand-cyan hover:text-brand-cyan/80 text-sm font-medium transition-colors duration-200">
                Forgot password?
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}