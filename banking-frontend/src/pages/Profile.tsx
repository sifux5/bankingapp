import { useState } from 'react';
import { userAPI } from '../services/api';
import type { LoginResponse } from '../types';

interface ProfileProps {
  user: LoginResponse;
  onLogout: () => void;
  onBack: () => void;
  onUpdate: (updated: LoginResponse) => void;
}

function Profile({ user, onLogout, onBack, onUpdate }: ProfileProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: '',
  });
  const [message, setMessage] = useState('');

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile(user.email, formData);
      onUpdate({ ...user, firstName: formData.firstName, lastName: formData.lastName, phoneNumber: formData.phoneNumber || user.phoneNumber });
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters');
      return;
    }
    if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(passwordData.newPassword)) {
      setPasswordMessage('Password must contain at least one number and one special character (!@#$%^&*)');
      return;
    }
    setLoading(true);
    try {
      await userAPI.changePassword(user.email, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      setPasswordMessage(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-blue-600 text-white p-4 shadow-lg dark:bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Banking App</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.firstName}!</span>
            <button onClick={onLogout} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-lg">
        <button onClick={onBack} className="mb-4 text-blue-600 hover:underline flex items-center gap-1">
          ← Back to Dashboard
        </button>

        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">My Profile</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Edit
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">First Name</label>
              {editing ? (
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Last Name</label>
              {editing ? (
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Phone Number</label>
              {editing ? (
                <input type="text" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" placeholder="Enter phone number" />
              ) : (
                <p className="text-gray-900 dark:text-white font-medium">{user.phoneNumber || 'Not set'}</p>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setMessage(''); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Change Password</h2>
            {!showPasswordForm && (
              <button onClick={() => setShowPasswordForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">
                Change
              </button>
            )}
          </div>

          {passwordMessage && (
            <div className={`mb-4 p-3 rounded ${passwordMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {passwordMessage}
            </div>
          )}

          {showPasswordForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">New Password</label>
                <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Confirm New Password</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleChangePassword} disabled={loading} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Password'}
                </button>
                <button onClick={() => { setShowPasswordForm(false); setPasswordMessage(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;