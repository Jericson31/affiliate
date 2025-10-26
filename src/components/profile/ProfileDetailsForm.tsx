import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { sessionManager } from '@/lib/auth/sessionManager';

export const ProfileDetailsForm: React.FC = () => {
  const { profile, updateReferralCode, updateProfile, user, createAffiliateRecord, refetch, loading } = useAuth();

  console.log('📄 ProfileDetailsForm - Component Render. User:', user ? `${user.id} (${user.email})` : 'null', 'Profile:', profile ? `${profile.id} (${profile.role})` : 'null', 'Loading:', loading);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const [referralCode, setReferralCode] = useState('');
  const [isUpdatingCode, setIsUpdatingCode] = useState(false);
  const [codeUpdateMessage, setCodeUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileUpdateMessage, setProfileUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUserProfile, setHasUserProfile] = useState(false);
  const [isCreatingAffiliate, setIsCreatingAffiliate] = useState(false);
  const [affiliateCreateMessage, setAffiliateCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);
  const [isValidatingSession, setIsValidatingSession] = useState(false);

  // Initialize form data, referral code, and profile state when profile loads
  useEffect(() => {
    if (profile) {
      setHasUserProfile(true);
      // Update form data with profile information
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        email: profile.email || user?.email || ''
      });
      
      // Update referral code
      setReferralCode(profile.partnership_code || '');
    } else if (user) {
      // If we have a user but no profile, user profile is missing
      setHasUserProfile(false);
      // Set email from user object for display
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    } else {
      setHasUserProfile(false);
    }
  }, [profile, user?.email]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📄 ProfileDetailsForm - handleSubmit called. User at submission:', user ? `${user.id} (${user.email})` : 'null');
    console.log('📄 ProfileDetailsForm - Form data being submitted:', formData);

    setIsValidatingSession(true);
    setProfileUpdateMessage(null);

    try {
      const validation = await sessionManager.validateSession();

      if (!validation.isValid) {
        setIsSessionValid(false);
        setProfileUpdateMessage({
          type: 'error',
          text: 'Your session has expired. Please sign in again.'
        });
        setIsValidatingSession(false);
        return;
      }
    } catch (error) {
      setIsSessionValid(false);
      setProfileUpdateMessage({
        type: 'error',
        text: 'Authentication validation failed. Please sign in again.'
      });
      setIsValidatingSession(false);
      return;
    }

    setIsValidatingSession(false);

    if (!user) {
      setProfileUpdateMessage({ type: 'error', text: 'No authenticated user found' });
      return;
    }
    
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setProfileUpdateMessage({ type: 'error', text: 'First name and last name are required' });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileUpdateMessage(null);

    try {
      await updateProfile(user.id, formData.firstName, formData.lastName, formData.phone);
      setProfileUpdateMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Profile update error - Full error object:', error);
      console.error('Profile update error - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Profile update error - Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Profile update error - Form data being submitted:', {
        userId: user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      setProfileUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleAvatarClick = () => {
    // Handle avatar upload
    console.log('Avatar upload clicked');
  };

  const handleUpdateReferralCode = async () => {
    if (!referralCode.trim()) {
      setCodeUpdateMessage({ type: 'error', text: 'Referral code cannot be empty' });
      return;
    }

    setIsValidatingSession(true);
    setCodeUpdateMessage(null);

    try {
      await sessionManager.requireValidSession();
    } catch (error) {
      setIsSessionValid(false);
      setCodeUpdateMessage({
        type: 'error',
        text: 'Your session has expired. Please sign in again.'
      });
      setIsValidatingSession(false);
      return;
    }

    setIsValidatingSession(false);
    setIsUpdatingCode(true);

    try {
      await updateReferralCode(referralCode.trim());
      setCodeUpdateMessage({ type: 'success', text: 'Referral code updated successfully!' });
    } catch (error) {
      setCodeUpdateMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update referral code' 
      });
    } finally {
      setIsUpdatingCode(false);
    }
  };

  const handleCreateAffiliateRecord = async () => {
    console.log('📄 ProfileDetailsForm - handleCreateAffiliateRecord: User from useAuth hook:', user);
    console.log('📄 ProfileDetailsForm - handleCreateAffiliateRecord: User details:', {
      exists: !!user,
      id: user?.id,
      email: user?.email,
      authenticated_at: user?.last_sign_in_at
    });

    if (loading) {
      setAffiliateCreateMessage({
        type: 'error',
        text: 'Please wait while authentication is being verified...'
      });
      return;
    }

    setIsValidatingSession(true);
    setAffiliateCreateMessage(null);

    try {
      await sessionManager.requireValidSession();
    } catch (error) {
      setIsSessionValid(false);
      setAffiliateCreateMessage({
        type: 'error',
        text: 'Your session has expired. Please sign in again.'
      });
      setIsValidatingSession(false);
      return;
    }

    setIsValidatingSession(false);

    if (!user) {
      setAffiliateCreateMessage({
        type: 'error',
        text: 'No authenticated user found. Please try logging in again.'
      });
      return;
    }

    setIsCreatingAffiliate(true);

    try {
      await createAffiliateRecord();
      setAffiliateCreateMessage({ type: 'success', text: 'Affiliate record created successfully!' });

      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error) {
      console.error('Error creating affiliate record:', error);
      setAffiliateCreateMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create affiliate record'
      });
    } finally {
      setIsCreatingAffiliate(false);
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Profile Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You have full control to manage your own account setting.
        </p>
      </div>

      {/* Authentication Status Banner */}
      {!isSessionValid && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Session Expired
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              Your authentication session has expired. Please sign in again to continue managing your profile.
            </p>
          </div>
        </div>
      )}

      {isSessionValid && user && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Authenticated
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Logged in as {user.email}
            </p>
          </div>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-2xl font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors duration-200"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          
          <div>
            <button
              onClick={handleAvatarClick}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Click To Update
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              PNG or JPG no bigger than 800px wide and tall.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Creation or Personal Details Form */}
      <div>
        {!hasUserProfile ? (
          /* Profile Creation Section - Show when no profile exists */
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Create Your Profile
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Welcome! To get started, you need to create your profile and affiliate account. This will set up your personal details and enable you to use referral codes.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Complete Your Profile Setup
              </h4>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Welcome! Your account is authenticated. To get started with the affiliate dashboard, you need to create your profile. This one-time setup will:
              </p>
              <ul className="list-disc list-inside text-blue-700 dark:text-blue-300 space-y-1 mb-4">
                <li>Create your personal profile with contact details</li>
                <li>Set up your unique referral code for tracking</li>
                <li>Enable full access to all affiliate features and analytics</li>
                <li>Allow you to manage leads, track sales, and view earnings</li>
              </ul>

              {affiliateCreateMessage && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${
                  affiliateCreateMessage.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                }`}>
                  {affiliateCreateMessage.text}
                </div>
              )}

              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 mt-1">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : user ? (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
                  ) : (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {loading ? 'Verifying authentication...' : user ? 'Authentication verified' : 'Authentication required'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {loading ? 'Please wait while we verify your session.' : user ? `Logged in as ${user.email}` : 'Please refresh the page or sign in again.'}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCreateAffiliateRecord}
                disabled={isCreatingAffiliate || loading || !user}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Verifying Authentication...' : isCreatingAffiliate ? 'Creating Your Profile...' : 'Create My Profile Now'}
              </Button>
            </div>
          </>
        ) : (
          /* Personal Details Form - Show when profile exists */
          <>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Personal Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Edit your personal information and address.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {profileUpdateMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  profileUpdateMessage.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                }`}>
                  {profileUpdateMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    readOnly
                    className="w-full bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email address is managed by your account authentication and cannot be changed here.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2"
                >
                  {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                </Button>
              </div>
            </form>

            {/* Referral Code Section - Only show when profile exists */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Referral Code
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Set or update your referral code for affiliate links.
              </p>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Referral Code
                  </label>
                  <Input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter your referral code"
                    className="w-full"
                  />
                </div>

                {codeUpdateMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    codeUpdateMessage.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  }`}>
                    {codeUpdateMessage.text}
                  </div>
                )}

                <Button
                  onClick={handleUpdateReferralCode}
                  disabled={isUpdatingCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  {isUpdatingCode ? 'Updating...' : 'Update Referral Code'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};