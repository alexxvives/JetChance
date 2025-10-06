import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Calendar,
  Building2,
  Shield,
  Bell,
  Lock,
  Save,
  ArrowLeft,
  Trash2
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [operator, setOperator] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('\n📥 ===== FRONTEND: PROFILE LOADED =====');
        console.log('📦 API Response:', data);
        console.log('📧 Notification Preferences from API:');
        console.log('   - emailNotifications:', data.profile?.emailNotifications);
        console.log('   - smsNotifications:', data.profile?.smsNotifications);
        console.log('   - marketingEmails:', data.profile?.marketingEmails);
        
        setUser(data.user);
        setOperator(data.operator);
        
        // Initialize profile data with API data first, then fall back to authUser data
        const initialProfileData = {
          ...data.profile,
          firstName: data.profile?.firstName || data.user?.firstName || authUser?.firstName || '',
          lastName: data.profile?.lastName || data.user?.lastName || authUser?.lastName || '',
          email: data.profile?.email || data.user?.email || authUser?.email || '',
          phone: data.profile?.phone || data.user?.phone || authUser?.phone || '',
          companyName: data.profile?.companyName || data.operator?.company_name || authUser?.companyName || '',
          companyAddress: data.profile?.companyAddress || data.operator?.company_address || authUser?.companyAddress || ''
        };
        
        console.log('📦 Final profileData state set to:', initialProfileData);
        console.log('===== END PROFILE LOAD =====\n');
        
        setProfileData(initialProfileData);
      } else {
        // If API fails, use authUser data as fallback
        if (authUser) {
          setUser(authUser);
          const fallbackProfileData = {
            firstName: authUser.firstName || '',
            lastName: authUser.lastName || '',
            email: authUser.email || '',
            phone: authUser.phone || ''
          };
          
          // Add operator-specific data if user is an operator
          if (authUser.role === 'operator') {
            fallbackProfileData.companyName = authUser.companyName || '';
            fallbackProfileData.companyAddress = authUser.companyAddress || '';
          }
          
          setProfileData(fallbackProfileData);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // If API fails, use authUser data as fallback
      if (authUser) {
        setUser(authUser);
        const errorFallbackData = {
          firstName: authUser.firstName || '',
          lastName: authUser.lastName || '',
          email: authUser.email || '',
          phone: authUser.phone || ''
        };
        
        // Add operator-specific data if user is an operator
        if (authUser.role === 'operator') {
          errorFallbackData.companyName = authUser.companyName || '';
          errorFallbackData.companyAddress = authUser.companyAddress || '';
        }
        
        setProfileData(errorFallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`🔄 Field changed: ${field} = ${value} (type: ${typeof value})`);
    
    // Calculate the new profile data
    const newData = {
      ...profileData,
      [field]: value
    };
    console.log('📦 Updated profileData state:', newData);
    
    // Update state
    setProfileData(newData);
    
    // Auto-save based on field type
    const notificationFields = ['emailNotifications', 'smsNotifications', 'marketingEmails'];
    
    if (notificationFields.includes(field)) {
      // Notification checkboxes: save immediately
      console.log('💾 Auto-saving notification preference...');
      handleSaveWithData(newData, true, field);
    } else {
      // Text fields: debounce to avoid too many requests
      console.log('⏱️ Debouncing auto-save for text field...');
      if (window.profileSaveTimeout) {
        clearTimeout(window.profileSaveTimeout);
      }
      window.profileSaveTimeout = setTimeout(() => {
        console.log('💾 Auto-saving profile data...');
        handleSaveWithData(newData, true, field);
      }, 1000); // Wait 1 second after user stops typing
    }
  };

  const handleSaveWithData = async (dataToSave, isAutoSave = false, changedField = null) => {
    setSaving(true);
    setMessage('');
    
    console.log('\n🚀 ===== FRONTEND: SAVING PROFILE =====');
    console.log('🔄 Auto-save:', isAutoSave, '| Changed field:', changedField);
    console.log('📦 profileData being sent:', dataToSave);
    console.log('📧 Notification Preferences:');
    console.log('   - emailNotifications:', dataToSave.emailNotifications, '(type:', typeof dataToSave.emailNotifications, ')');
    console.log('   - smsNotifications:', dataToSave.smsNotifications, '(type:', typeof dataToSave.smsNotifications, ')');
    console.log('   - marketingEmails:', dataToSave.marketingEmails, '(type:', typeof dataToSave.marketingEmails, ')');
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        if (isAutoSave) {
          // For auto-save, show a brief success indicator
          setMessage('✓ Saved');
          setTimeout(() => setMessage(''), 1500);
        } else {
          // For manual save, show full message
          setMessage('Profile updated successfully!');
          setTimeout(() => setMessage(''), 3000);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
      console.log('===== END FRONTEND SAVE =====\n');
    }
  };

  const handleSave = async (isAutoSave = false, changedField = null) => {
    // Wrapper for manual saves - uses current state
    return handleSaveWithData(profileData, isAutoSave, changedField);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setMessage('Please type DELETE to confirm account deletion');
      return;
    }

    setDeleting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Account deleted successfully. Redirecting...');
        setTimeout(() => {
          logout();
          navigate('/');
        }, 2000);
      } else {
        const data = await response.json();
        setMessage(data.error || 'Failed to delete account');
        setDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage('Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role || authUser?.role || 'customer';
  const currentUser = user || authUser;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account information and preferences
          </p>
        </div>
            {message && (
              <div className={`mt-4 p-3 rounded-md ${
                message === '✓ Saved'
                  ? 'bg-green-50 text-green-700 border border-green-200 text-sm'
                  : message.includes('successfully') || message.includes('Saved')
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="px-6 py-6 space-y-8">
            {/* Personal Information Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </div>

            {/* Company Information for Operators */}
            {userRole === 'operator' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                  Company Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName || operator?.companyName || ''}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operator ID
                    </label>
                    <input
                      type="text"
                      value={operator?.operatorId || operator?.id || currentUser?.operatorId || currentUser?.id || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Address
                    </label>
                    <input
                      type="text"
                      value={profileData.companyAddress || ''}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company address"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Notification Preferences for Customers */}
            {userRole === 'customer' && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-blue-600" />
                  Notification Preferences
                </h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">Choose how you'd like to receive updates about your bookings and account.</p>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        checked={profileData.emailNotifications === true}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Email Notifications
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Receive booking confirmations, flight updates, and important account information</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        checked={profileData.smsNotifications === true}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="smsNotifications" className="text-sm font-medium text-gray-900 cursor-pointer">
                          SMS Notifications
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Get text message alerts for time-sensitive flight changes and reminders</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-md border border-gray-200">
                      <input
                        type="checkbox"
                        id="marketingEmails"
                        checked={profileData.marketingEmails === true}
                        onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <label htmlFor="marketingEmails" className="text-sm font-medium text-gray-900 cursor-pointer">
                          Marketing Communications
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Receive promotional offers, flight deals, and news about our services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Security & Account
              </h2>
              <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="inline h-4 w-4 mr-1" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileData.currentPassword || ''}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileData.newPassword || ''}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileData.confirmPassword || ''}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Delete Account */}
            <div className="mt-8 pt-8 border-t border-gray-200">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Type <span className="font-bold">DELETE</span> to confirm:
                      </label>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        disabled={deleting}
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting || deleteConfirmText !== 'DELETE'}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Permanently Delete Account
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText('');
                        }}
                        disabled={deleting}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
  );
};

export default Profile;

