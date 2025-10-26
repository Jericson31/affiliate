import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const PayoutInformationForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    paymentProcessor: '',
    firstName: '',
    middleName: '',
    lastName: '',
    accountNumber: '',
    email: '',
    countryCode: '+63',
    mobileNumber: '',
    birthdate: '',
    nationality: '',
    country: 'Philippines',
    street1: '',
    street2: '',
    barangay: '',
    city: '',
    province: ''
  });

  useEffect(() => {
    const fetchPayoutInfo = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/payout');
        const result = await response.json();

        if (response.ok && result.data) {
          const data = result.data;
          setFormData({
            paymentProcessor: data.payment_processor || '',
            firstName: data.first_name || '',
            middleName: data.middle_name || '',
            lastName: data.last_name || '',
            accountNumber: data.account_number || '',
            email: data.email || '',
            countryCode: data.country_code || '+63',
            mobileNumber: data.mobile_number || '',
            birthdate: data.birthdate || '',
            nationality: data.nationality || '',
            country: data.country || 'Philippines',
            street1: data.street1 || '',
            street2: data.street2 || '',
            barangay: data.barangay || '',
            city: data.city || '',
            province: data.province || ''
          });
        }
      } catch (error) {
        console.error('Error fetching payout information:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutInfo();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setMessage({ type: 'error', text: 'You must be logged in to save payout information' });
      return;
    }

    // Validate required fields
    const requiredFields = [
      { field: 'paymentProcessor', label: 'Payment Processor' },
      { field: 'firstName', label: 'First Name' },
      { field: 'lastName', label: 'Last Name' },
      { field: 'accountNumber', label: 'Account Number' },
      { field: 'email', label: 'Email Address' },
      { field: 'mobileNumber', label: 'Mobile Number' },
      { field: 'street1', label: 'Street Address' },
      { field: 'city', label: 'City' },
      { field: 'province', label: 'Province' }
    ];

    for (const { field, label } of requiredFields) {
      if (!formData[field as keyof typeof formData] || formData[field as keyof typeof formData].trim() === '') {
        setMessage({ type: 'error', text: `${label} is required` });
        return;
      }
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_processor: formData.paymentProcessor,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          account_number: formData.accountNumber,
          email: formData.email,
          country_code: formData.countryCode,
          mobile_number: formData.mobileNumber,
          birthdate: formData.birthdate,
          nationality: formData.nationality,
          country: formData.country,
          street1: formData.street1,
          street2: formData.street2,
          barangay: formData.barangay,
          city: formData.city,
          province: formData.province
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Payout information saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save payout information' });
      }
    } catch (error) {
      console.error('Error saving payout information:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving payout information' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payout information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Payout Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          These page allows you to update your bank details for receiving your payout request for ensuring a smooth and secure transaction process.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {message && (
          <div className={`p-4 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}
        {/* Payout Account Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Payout Account Details
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please enter your bank information to enable payout requests.
          </p>

          {/* Payment Processor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Processor
            </label>
            <select
              value={formData.paymentProcessor}
              onChange={(e) => handleInputChange('paymentProcessor', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select Processor --</option>
              <option value="gcash">GCash</option>
              <option value="paymaya">PayMaya</option>
              <option value="bank">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              <Input
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Middle Name
              </label>
              <Input
                type="text"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleInputChange('middleName', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              <Input
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Processing Details */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Processing Details
          </h3>

          <div className="mb-6">
            <Input
              type="text"
              placeholder="Account Number or E-Wallet Number"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Recipient Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Recipient Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobile Number
              </label>
              <div className="flex space-x-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="+63">+63</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                </select>
                <Input
                  type="tel"
                  placeholder="(Example: 9161231234)"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Birthdate
              </label>
              <Input
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange('birthdate', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nationality
              </label>
              <Input
                type="text"
                placeholder="Nationality"
                value={formData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <Input
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Address
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Street1
              </label>
              <Input
                type="text"
                placeholder="Street1"
                value={formData.street1}
                onChange={(e) => handleInputChange('street1', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Street2 (Optional)
              </label>
              <Input
                type="text"
                placeholder="Street2"
                value={formData.street2}
                onChange={(e) => handleInputChange('street2', e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barangay
                </label>
                <Input
                  type="text"
                  placeholder="Barangay"
                  value={formData.barangay}
                  onChange={(e) => handleInputChange('barangay', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <Input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Province
                </label>
                <Input
                  type="text"
                  placeholder="Province (ex. Metro Manila)"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Update Payout Information'}
          </Button>
        </div>
      </form>
    </div>
  );
};