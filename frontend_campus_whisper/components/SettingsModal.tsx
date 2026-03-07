import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { UserAvatar } from './Avatars';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ type: 'error', text: 'All fields are required' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setPwMsg({ type: '', text: '' });
    setPwLoading(true);
    try {
      await authAPI.updatePassword(currentPassword, newPassword);
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This action is irreversible. Your identity will be lost forever.')) return;
    setDeleteLoading(true);
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-auto transform transition-all">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-neutral-900">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Icon name="settings" className="text-neutral-400" />
              Settings
            </h2>
            <button
              className="text-white/40 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/5"
              onClick={onClose}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto bg-neutral-900">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-neutral-500 to-neutral-800 flex items-center justify-center">
                  <UserAvatar name={user?.alias || 'User'} size={88} />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white tracking-wide">{user?.alias || 'Anonymous'}</h3>
                <p className="text-neutral-500 text-sm mt-1">Anonymous Student Identity</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online &amp; Whispering
                </div>
              </div>
            </div>
            <hr className="border-white/5" />
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="lock" className="text-neutral-400" />
                <h4 className="text-lg font-semibold text-white">Password & Security</h4>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {pwMsg.text && (
                  <div className={`p-3 rounded-lg text-sm ${pwMsg.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                    {pwMsg.text}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-sm text-neutral-500 ml-1" htmlFor="current-password">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all duration-200 font-display pr-10"
                      id="current-password"
                      placeholder="••••••••••••"
                      type={showCurrentPw ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      <Icon name={showCurrentPw ? 'visibility' : 'visibility_off'} className="text-lg" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-neutral-500 ml-1" htmlFor="new-password">
                      New Password
                    </label>
                    <input
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all duration-200 font-display"
                      id="new-password"
                      placeholder="New secret..."
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-neutral-500 ml-1" htmlFor="confirm-password">
                      Confirm Password
                    </label>
                    <input
                      className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all duration-200 font-display"
                      id="confirm-password"
                      placeholder="Repeat secret..."
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    className="px-6 py-2.5 bg-white hover:bg-neutral-200 text-black font-medium rounded-lg shadow-lg shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    type="button"
                    disabled={pwLoading}
                    onClick={handleUpdatePassword}
                  >
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>
            <hr className="border-white/5" />
            <section className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/80">
                    <Icon name="devices" />
                  </div>
                  <div>
                    <h5 className="text-white font-medium">Active Session</h5>
                    <p className="text-xs text-neutral-500">San Francisco, US • Mac OS Chrome</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 hover:border-white/20 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <Icon name="logout" className="text-lg text-white/70" />
                  Logout
                </button>
              </div>
            </section>
            <section className="pt-4">
              <div className="border border-danger/30 bg-danger/5 rounded-xl p-5 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #ef4444 0, #ef4444 1px, transparent 0, transparent 50%)',
                    backgroundSize: '10px 10px',
                  }}
                ></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-danger font-bold flex items-center gap-2">
                      <Icon name="warning" />
                      Danger Zone
                    </h4>
                    <p className="text-sm text-neutral-400 max-w-xs">
                      This action is irreversible. Your whispers will remain, but you will lose access to this identity forever.
                    </p>
                  </div>
                  <button 
                    className="px-4 py-2 bg-transparent border border-danger/40 text-danger hover:bg-danger hover:text-white rounded-lg text-sm font-bold transition-all whitespace-nowrap disabled:opacity-50"
                    disabled={deleteLoading}
                    onClick={handleDeleteAccount}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};