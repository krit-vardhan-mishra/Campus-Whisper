import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from './Icon';
import { roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  refreshRooms?: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, refreshRooms }) => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) {
      setError('Room name and category are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await roomsAPI.create({
        name: name.trim(),
        description: description.trim(),
        category,
        tags: [category],
        image: image.trim() || undefined,
      });
      await refreshUser();
      if (refreshRooms) refreshRooms();
      onClose();
      navigate(`/room/${res.data.id || res.data._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-neutral-900 text-left shadow-2xl transition-all w-full max-w-lg border border-white/10">
          
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
                  <Icon name="add_circle" className="text-emerald-500 text-2xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold leading-6 text-white font-display">Create a New Space</h3>
                  <p className="text-sm text-neutral-400 mt-1">Start a conversation without friction.</p>
                </div>
              </div>
          </div>

          <div className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              {/* Room Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="room-name" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Room Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="tag" className="text-neutral-500 text-sm group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="room-name"
                    id="room-name"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all focus:outline-none"
                    placeholder="e.g., Late Night Study Group"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Category
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="category" className="text-neutral-500 text-sm group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <select
                    id="category"
                    name="category"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-10 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm appearance-none transition-all cursor-pointer focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="" disabled className="text-neutral-500">Select a vibe...</option>
                    <option value="tech">💻 Tech & Engineering</option>
                    <option value="social">🎉 Social & Chill</option>
                    <option value="confessions">🤫 Confessions</option>
                    <option value="study">📚 Study Groups</option>
                    <option value="gaming">🎮 Gaming</option>
                    <option value="academic">🎓 Academic Support</option>
                    <option value="clubs">🏛️ Clubs & Orgs</option>
                    <option value="memes">😂 Memes & Humor</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="music">🎵 Music</option>
                    <option value="mental-health">🧠 Mental Health</option>
                    <option value="marketplace">🛒 Marketplace</option>
                    <option value="events">📅 Events</option>
                    <option value="careers">💼 Careers & Placements</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                    <Icon name="expand_more" className="text-lg" />
                  </div>
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Description
                </label>
                <div className="relative group">
                   <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 px-4 text-white placeholder-neutral-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm resize-none transition-all focus:outline-none"
                    placeholder="What is this room about? Keep it brief."
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, 140))}
                  />
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                      <Icon name="edit_note" className="text-neutral-600 text-sm group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-600 text-right">{description.length}/140 characters</p>
              </div>

              {/* Room Image URL (Optional) */}
              <div className="space-y-1.5">
                <label htmlFor="room-image" className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">
                  Room Photo <span className="text-neutral-600 normal-case">(optional)</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="image" className="text-neutral-500 text-sm group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="url"
                    name="room-image"
                    id="room-image"
                    className="block w-full rounded-xl border border-white/10 bg-neutral-950 py-3 pl-10 pr-4 text-white placeholder-neutral-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 sm:text-sm transition-all focus:outline-none"
                    placeholder="Paste an image URL or leave blank for default"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
                {image && (
                  <div className="mt-2 relative rounded-lg overflow-hidden h-24 bg-neutral-950 border border-white/10">
                    <img
                      src={image}
                      alt="Room preview"
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
                    >
                      <Icon name="close" className="text-xs" />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-neutral-600 ml-1">A category-based image will be used if left empty.</p>
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
                      <Icon name="rocket_launch" className="text-lg" />
                    )}
                    {loading ? 'Creating...' : 'Create Space'}
                </button>
              </div>

            </form>
          </div>

          <div className="bg-neutral-950/50 px-6 py-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <Icon name="vpn_key" className="text-sm" />
              <span>Identity protected. Host is anonymous.</span>
          </div>
        </div>
      </div>
    </div>
  );
};