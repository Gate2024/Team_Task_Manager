import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api';

export function AccountSettings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile Information State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    mobile_number: user?.mobile_number || '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Sync profileForm when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        mobile_number: user.mobile_number || '',
      });
    }
  }, [user]);

  // Profile Image Upload & Preview State
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Security / Password State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  // Danger Zone / Account Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Helper for initials
  const getInitials = (name) => {
    if (!name) return 'TM';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Clean up preview object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Reset image load error state whenever the avatar source changes
  const activeAvatarSrc = imagePreview || user?.profile_image_url;
  useEffect(() => {
    setAvatarLoadError(false);
  }, [activeAvatarSrc]);

  // ----------------------------------------------------
  // PROFILE INFORMATION HANDLERS
  // ----------------------------------------------------
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setProfileError(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileError('Full Name is required.');
      return;
    }

    if (profileForm.mobile_number && profileForm.mobile_number.trim()) {
      const digitsOnly = profileForm.mobile_number.replace(/[\s\-\(\)\+]/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15 || !/^\d+$/.test(digitsOnly)) {
        setProfileError('Mobile number must contain between 10 and 15 digits.');
        return;
      }
    }

    setProfileSaving(true);
    setProfileError(null);

    try {
      const payload = {
        name: profileForm.name.trim(),
        mobile_number: profileForm.mobile_number ? profileForm.mobile_number.trim() : null,
      };

      const res = await authApi.updateProfile(payload);
      const updatedUser = res.user || res;
      setUser(updatedUser);
      toast.success('Profile updated successfully.');
    } catch (err) {
      const errMsg = err.data?.message || err.message || 'Unable to update profile.';
      setProfileError(errMsg);
      toast.error(errMsg);
    } finally {
      setProfileSaving(false);
    }
  };

  // ----------------------------------------------------
  // PROFILE IMAGE HANDLERS
  // ----------------------------------------------------
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const msg = 'Invalid file type. Please upload a JPEG, PNG, or WEBP image.';
      setImageError(msg);
      toast.error(msg);
      return;
    }

    // Validate size (5MB maximum)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      const msg = 'Image exceeds maximum size of 5 MB.';
      setImageError(msg);
      toast.error(msg);
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCancelImagePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;

    setImageUploading(true);
    setImageError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await authApi.uploadProfileImage(formData);
      const updatedUser = res.user || res;
      setUser(updatedUser);
      toast.success('Profile photo updated successfully.');
      handleCancelImagePreview();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to upload profile photo.';
      setImageError(msg);
      toast.error(msg);
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsRemovingPhoto(true);
    setImageError(null);

    try {
      const res = await authApi.deleteProfileImage();
      const updatedUser = res.user || res;
      setUser(updatedUser);
      toast.success('Profile photo removed.');
      handleCancelImagePreview();
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to remove profile photo.';
      setImageError(msg);
      toast.error(msg);
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  // ----------------------------------------------------
  // SECURITY / PASSWORD HANDLERS
  // ----------------------------------------------------
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordForm.current_password) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!passwordForm.new_password) {
      setPasswordError('New password is required.');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await authApi.updateProfile({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });

      setPasswordSuccess('Password updated successfully.');
      toast.success('Password updated successfully.');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      const msg = err.data?.message || err.message || 'Unable to update password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setPasswordSaving(false);
    }
  };

  // ----------------------------------------------------
  // DANGER ZONE / ACCOUNT DELETION HANDLERS
  // ----------------------------------------------------
  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('Password is required to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      await authApi.deleteAccount({ password: deletePassword });
      toast.success('Account successfully deleted.');
      setIsDeleteModalOpen(false);
      await logout();
      navigate('/register');
    } catch (err) {
      const msg = err.data?.message || err.message || 'Failed to delete account.';
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <AppShell breadcrumb="Account Settings">
      <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fadeIn">
        {/* Page Header */}
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your personal profile, security credentials, and workspace preferences.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 1: PROFILE & AVATAR                              */}
        {/* ======================================================== */}
        <section
          aria-labelledby="profile-heading"
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
            <h2 id="profile-heading" className="text-base font-bold text-slate-900 dark:text-white">
              Profile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your photo, display name, and public contact information.
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Profile Photo
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar Display */}
                <div className="relative group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-md flex-shrink-0">
                    {activeAvatarSrc && !avatarLoadError ? (
                      <img
                        key={activeAvatarSrc}
                        src={activeAvatarSrc}
                        alt={`${user?.name || 'User'}'s profile avatar`}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarLoadError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center select-none">
                        {getInitials(user?.name)}
                      </div>
                    )}
                  </div>

                  {imagePreview && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-500 text-white font-bold text-[9px] rounded-full uppercase tracking-wider shadow">
                      Preview
                    </span>
                  )}
                </div>

                {/* Upload & Management Actions */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <input
                    ref={fileInputRef}
                    id="profile-image-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="sr-only"
                    aria-label="Upload profile photo"
                  />

                  {/* Staged Preview Controls */}
                  {selectedFile ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleSaveImage}
                        disabled={imageUploading}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
                      >
                        {imageUploading ? (
                          <>
                            <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Save Photo</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelImagePreview}
                        disabled={imageUploading}
                        className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    /* Default Change / Remove Buttons */
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors border border-slate-200/80 dark:border-slate-700"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Change photo</span>
                      </button>

                      {user?.profile_image_url && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isRemovingPhoto}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
                        >
                          {isRemovingPhoto ? (
                            <span>Removing...</span>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Remove</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Supports JPG, PNG, or WEBP up to 5 MB. Square aspect ratio recommended.
                  </p>

                  {imageError && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Form Details */}
            <form onSubmit={handleProfileSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              {profileError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{profileError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="settings-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="settings-mobile" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    id="settings-mobile"
                    type="tel"
                    name="mobile_number"
                    value={profileForm.mobile_number}
                    onChange={handleProfileChange}
                    autoComplete="tel"
                    placeholder="+1 555-0199 or 10-15 digits"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="settings-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    Permanent account identifier
                  </span>
                </div>
                <input
                  id="settings-email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  readOnly
                  aria-readonly="true"
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-sm cursor-not-allowed select-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {profileSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: SECURITY & PASSWORD                           */}
        {/* ======================================================== */}
        <section
          aria-labelledby="security-heading"
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
            <h2 id="security-heading" className="text-base font-bold text-slate-900 dark:text-white">
              Security
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Change your password and safeguard your account credentials.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-2xl">
              {passwordError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Current Password */}
              <div>
                <label htmlFor="settings-current-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="settings-current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="current_password"
                    value={passwordForm.current_password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    {showCurrentPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="settings-new-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      name="new_password"
                      value={passwordForm.new_password}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="settings-confirm-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="settings-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordChange}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 pr-10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Update Password Action */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  {passwordSaving ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 3: APPEARANCE                                    */}
        {/* ======================================================== */}
        <section
          aria-labelledby="appearance-heading"
          className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
            <h2 id="appearance-heading" className="text-base font-bold text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize the look and feel of the TeamTask workspace.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all group ${
                  theme === 'light'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="w-full h-20 rounded-xl bg-slate-100 border border-slate-200/80 p-2.5 mb-3.5 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="w-3/4 h-2 bg-slate-200 rounded" />
                  <div className="w-1/2 h-2 bg-indigo-200 rounded" />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Light</span>
                  </div>
                  {theme === 'light' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Clean, crisp high-contrast theme.
                </p>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all group ${
                  theme === 'dark'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="w-full h-20 rounded-xl bg-slate-900 border border-slate-800 p-2.5 mb-3.5 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="w-3/4 h-2 bg-slate-800 rounded" />
                  <div className="w-1/2 h-2 bg-indigo-600/80 rounded" />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Dark</span>
                  </div>
                  {theme === 'dark' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Modern, sleek low-light palette.
                </p>
              </button>

              {/* System Preference Card */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all group ${
                  theme === 'system'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40'
                }`}
              >
                <div className="w-full h-20 rounded-xl bg-gradient-to-r from-slate-100 to-slate-900 border border-slate-300 dark:border-slate-700 p-2.5 mb-3.5 flex flex-col justify-between overflow-hidden shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  </div>
                  <div className="w-3/4 h-2 bg-slate-400/50 rounded" />
                  <div className="w-1/2 h-2 bg-indigo-400/50 rounded" />
                </div>

                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">System</span>
                  </div>
                  {theme === 'system' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Synchronize with your operating system.
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 4: DANGER ZONE                                   */}
        {/* ======================================================== */}
        <section
          aria-labelledby="danger-heading"
          className="bg-white dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/40 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20">
            <h2 id="danger-heading" className="text-base font-bold text-rose-600 dark:text-rose-400">
              Danger Zone
            </h2>
            <p className="text-xs text-rose-500/80 dark:text-rose-400/80 mt-0.5">
              Irreversible account operations and permanent data destruction.
            </p>
          </div>

          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Permanently delete your account, personal details, project ownerships, and associated workspace assignments. This action is immediate and non-recoverable.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeletePassword('');
                setDeleteError(null);
                setIsDeleteModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Account</span>
            </button>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL                        */}
      {/* ======================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-10">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Account Confirmation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you absolutely sure you want to permanently delete your account? All projects you own, your profile information, and task assignments will be erased immediately.
              </p>

              {deleteError && (
                <div className="mt-4 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{deleteError}</span>
                </div>
              )}

              <form onSubmit={handleDeleteAccountSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="confirm-delete-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Enter your password to confirm
                  </label>
                  <input
                    id="confirm-delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                    placeholder="Current password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isDeletingAccount}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-600/20 transition-all"
                  >
                    {isDeletingAccount ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Confirm Delete</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default AccountSettings;
