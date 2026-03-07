import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { roomsAPI } from '../services/api';
import { getRoomImage, UserAvatar } from './Avatars';
import { useAuth } from '../context/AuthContext';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  onUpdated: (updatedRoom: any) => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({ isOpen, onClose, room, onUpdated }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'members'>('details');

  // Sync form when room changes or modal opens
  useEffect(() => {
    if (room && isOpen) {
      setName(room.name || '');
      setCategory(room.category || 'social');
      setDescription(room.description || '');
      setImage(room.image || '');
      setTags(room.tags?.join(', ') || '');
      setError('');
      setSuccess('');
      setActiveTab('details');
    }
  }, [room, isOpen]);

  if (!isOpen || !room) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await roomsAPI.update(room.id || room._id, {
        name: name.trim(),
        description: description.trim(),
        category,
        tags: tagArray,
        image: image.trim(),
      });
      setSuccess('Room updated successfully!');
      onUpdated(res.data);
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this room? This action is irreversible and will delete all messages.')) return;
    setLoading(true);
    try {
      await roomsAPI.delete(room.id || room._id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const previewImage = image.trim() || getRoomImage(category);

  const adminIds = (room.admins || []).map((a: any) => a._id || a.id || a);
  const isUserAdmin = (userId: string) => adminIds.includes(userId);

  const handlePromote = async (userId: string) => {
    setAdminLoading(userId);
    setError('');
    try {
      const res = await roomsAPI.addAdmin(room.id || room._id, userId);
      onUpdated(res.data);
      setSuccess('Admin added!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to promote member');
    } finally {
      setAdminLoading(null);
    }
  };

  const handleDemote = async (userId: string) => {
    setAdminLoading(userId);
    setError('');
    try {
      const res = await roomsAPI.removeAdmin(room.id || room._id, userId);
      onUpdated(res.data);
      setSuccess('Admin removed!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to demote admin');
    } finally {
      setAdminLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-neutral-900 text-left shadow-2xl w-full max-w-lg border border-white/10">

          {/* Header */}
          <div className="relative p-6 pb-0">
            <div className="absolute right-4 top-4">
              <button
                className="rounded-lg p-2 text-neutral-500 hover:bg-white/5 hover:text-white transition-all"
                onClick={onClose}
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 shadow-inner">
                <Icon name="edit" className="text-cyan-400 text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold leading-6 text-white font-display">Edit Room</h3>
                <p className="text-sm text-neutral-400 mt-1">Update room details as admin.</p>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 mt-4 bg-neutral-950 rounded-lg p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'details' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <Icon name="tune" className="text-sm mr-1.5 align-middle" />Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${activeTab === 'members' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                <Icon name="group" className="text-sm mr-1.5 align-middle" />Members
              </button>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-4">
                {success}
              </div>
            )}

            {activeTab === 'details' ? (
            <>
            <form className="space-y-5" onSubmit={handleSave}>

              {/* Room Image Preview + Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Room Photo
                </label>
                <div className="relative rounded-xl overflow-hidden h-32 bg-neutral-950 border border-white/10 group">
                  <img
                    src={previewImage}
                    alt="Room"
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getRoomImage(category);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 h-7 w-7 bg-black/60 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/80 transition-colors"
                      title="Remove custom image"
                    >
                      <Icon name="close" className="text-sm" />
                    </button>
                  )}
                  <div className="absolute bottom-2 left-3 text-xs text-white/50">
                    {image ? 'Custom image' : `Default (${category || 'social'})`}
                  </div>
                </div>
                <div className="relative group mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="link" className="text-neutral-500 text-sm group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-2.5 pl-10 pr-4 text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all focus:outline-none"
                    placeholder="Paste image URL or leave blank for default"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
              </div>

              {/* Room Name */}
              <div className="space-y-1.5">
                <label htmlFor="edit-room-name" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Room Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="tag" className="text-neutral-500 text-sm group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="edit-room-name"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all focus:outline-none"
                    placeholder="Room name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label htmlFor="edit-category" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Category
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="category" className="text-neutral-500 text-sm group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <select
                    id="edit-category"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-10 text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm appearance-none transition-all cursor-pointer focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="tech">Tech & Engineering</option>
                    <option value="social">Social & Chill</option>
                    <option value="confessions">Confessions</option>
                    <option value="gaming">Gaming</option>
                    <option value="study">Study</option>
                    <option value="academic">Academic Support</option>
                    <option value="clubs">Clubs & Orgs</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                    <Icon name="expand_more" className="text-lg" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label htmlFor="edit-description" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={3}
                  className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 px-4 text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm resize-none transition-all focus:outline-none"
                  placeholder="What is this room about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                />
                <p className="text-[10px] text-neutral-600 text-right">{description.length}/200 characters</p>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label htmlFor="edit-tags" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Tags <span className="text-neutral-600 normal-case">(comma separated)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="label" className="text-neutral-500 text-sm group-focus-within:text-cyan-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="edit-tags"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all focus:outline-none"
                    placeholder="e.g., study, freshman, chill"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex w-full justify-center items-center rounded-xl bg-transparent px-5 py-3 text-sm font-bold text-neutral-400 border border-white/10 hover:bg-white/5 hover:text-white transition-all sm:w-auto"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-white text-black px-6 py-3 text-sm font-bold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:scale-[1.02] sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <Icon name="save" className="text-lg" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                    <Icon name="warning" className="text-base" />
                    Danger Zone
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Permanently delete this room and all messages.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-sm font-bold transition-all whitespace-nowrap disabled:opacity-50"
                >
                  Delete Room
                </button>
              </div>
            </div>
            </>
            ) : (
            /* Members Tab */
            <div className="space-y-4">
              <p className="text-xs text-neutral-500">Promote members to admin or demote existing admins. Admins can edit room details and manage members.</p>
              
              <div className="space-y-2 max-h-[360px] overflow-y-auto scrollbar-hide">
                {room.members?.length > 0 ? room.members.map((member: any) => {
                  const memberId = member._id || member.id || member;
                  const memberAlias = member.alias || 'Unknown';
                  const memberIsAdmin = isUserAdmin(memberId);
                  const isCreator = (room.createdBy?._id || room.createdBy?.id || room.createdBy) === memberId;
                  const isMe = memberId === (user?.id || user?._id);

                  return (
                    <div
                      key={memberId}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <UserAvatar name={memberAlias} size={36} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white truncate">{memberAlias}</span>
                            {isMe && <span className="text-[10px] bg-white/10 text-neutral-400 px-1.5 py-0.5 rounded-full">You</span>}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isCreator && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">Creator</span>
                            )}
                            {memberIsAdmin && (
                              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">Admin</span>
                            )}
                            {!memberIsAdmin && (
                              <span className="text-[10px] text-neutral-500">Member</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Don't show action for yourself */}
                      {!isMe && (
                        <div className="flex-shrink-0 ml-2">
                          {memberIsAdmin ? (
                            <button
                              type="button"
                              disabled={adminLoading === memberId || room.admins?.length <= 1}
                              onClick={() => handleDemote(memberId)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              title={room.admins?.length <= 1 ? 'Cannot remove last admin' : 'Remove admin role'}
                            >
                              {adminLoading === memberId ? (
                                <div className="h-3 w-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                'Demote'
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={adminLoading === memberId}
                              onClick={() => handlePromote(memberId)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Make this member an admin"
                            >
                              {adminLoading === memberId ? (
                                <div className="h-3 w-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                              ) : (
                                'Promote'
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    <Icon name="group_off" className="text-3xl mb-2 block mx-auto" />
                    No members to show
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
