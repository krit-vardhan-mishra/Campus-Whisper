import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { DashboardLayout, useDashboard } from '../layout/DashboardLayout';
import { roomsAPI } from '../services/api';
import { getRoomImage, UserAvatar } from '../components/Avatars';
import { useAuth } from '../context/AuthContext';

const getTagStyles = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('code')) return 'bg-cyan-900/30 text-cyan-400 border-cyan-800/50';
  if (t.includes('social') || t.includes('chill')) return 'bg-pink-900/30 text-pink-400 border-pink-800/50';
  if (t.includes('game') || t.includes('gaming')) return 'bg-orange-900/30 text-orange-400 border-orange-800/50';
  if (t.includes('study') || t.includes('focus')) return 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50';
  if (t.includes('confess')) return 'bg-violet-900/30 text-violet-400 border-violet-800/50';
  if (t.includes('meme')) return 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50';
  if (t.includes('sport') || t.includes('fitness')) return 'bg-green-900/30 text-green-400 border-green-800/50';
  if (t.includes('music')) return 'bg-fuchsia-900/30 text-fuchsia-400 border-fuchsia-800/50';
  if (t.includes('mental') || t.includes('health')) return 'bg-teal-900/30 text-teal-400 border-teal-800/50';
  if (t.includes('market')) return 'bg-amber-900/30 text-amber-400 border-amber-800/50';
  if (t.includes('event')) return 'bg-indigo-900/30 text-indigo-400 border-indigo-800/50';
  if (t.includes('career') || t.includes('placement')) return 'bg-blue-900/30 text-blue-400 border-blue-800/50';
  if (t.includes('club')) return 'bg-rose-900/30 text-rose-400 border-rose-800/50';
  if (t.includes('academic')) return 'bg-sky-900/30 text-sky-400 border-sky-800/50';
  return 'bg-white/10 text-white border-white/10';
};

const getCardBorder = (tag: string) => {
    const t = tag.toLowerCase();
    if (t.includes('tech')) return 'hover:border-cyan-500/50';
    if (t.includes('social')) return 'hover:border-pink-500/50';
    if (t.includes('game')) return 'hover:border-orange-500/50';
    if (t.includes('study')) return 'hover:border-emerald-500/50';
    if (t.includes('confess')) return 'hover:border-violet-500/50';
    if (t.includes('meme')) return 'hover:border-yellow-500/50';
    if (t.includes('sport')) return 'hover:border-green-500/50';
    if (t.includes('music')) return 'hover:border-fuchsia-500/50';
    if (t.includes('mental')) return 'hover:border-teal-500/50';
    if (t.includes('market')) return 'hover:border-amber-500/50';
    if (t.includes('event')) return 'hover:border-indigo-500/50';
    if (t.includes('career')) return 'hover:border-blue-500/50';
    if (t.includes('club')) return 'hover:border-rose-500/50';
    if (t.includes('academic')) return 'hover:border-sky-500/50';
    return 'hover:border-white/30';
}

const RoomCard = memo<{
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  online: string;
  memberCount?: number;
  isPrivate?: boolean;
  isJoined?: boolean;
  onJoin?: () => void;
  onCardClick?: () => void;
}>(({ id, title, description, image, tag, online, memberCount, isPrivate, isJoined, onJoin, onCardClick }) => {
  const extra = memberCount && memberCount > 2 ? `+${memberCount - 2}` : undefined;
  return (
    <div 
      className={`group relative bg-neutral-900/50 rounded-xl overflow-hidden border border-white/5 transition-colors duration-200 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] flex flex-col h-[340px] ${getCardBorder(tag)} hover:-translate-y-1 cursor-pointer`}
      onClick={onCardClick}
    >
      <div className="h-36 w-full relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950/90 z-10"></div>
        {image ? (
          <img
            src={image}
            loading="lazy"
            decoding="async"
            className={isJoined
              ? "w-full h-full object-cover opacity-100"
              : "w-full h-full object-cover grayscale group-hover:scale-105 group-hover:grayscale-0 transition-[transform,filter] duration-500 opacity-60 group-hover:opacity-100 will-change-transform"
            }
            alt={title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-800">
               <Icon name="pattern" className="text-6xl text-white/5" />
          </div>
        )}
        <div className={`absolute top-3 right-3 z-20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border ${getTagStyles(tag)}`}>
          {tag}
        </div>
        {isPrivate && (
            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2 text-white/50">
              <Icon name="visibility_off" className="text-lg" />
              <span className="text-xs font-medium uppercase tracking-wider">Private</span>
            </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
        </div>
        <p className="text-sm text-neutral-400 line-clamp-2 mb-4">{description}</p>
        <div className="mt-auto flex items-center justify-between">
          {extra ? (
               <div className="flex items-center -space-x-2">
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-900 bg-neutral-700"></div>
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-900 bg-neutral-600"></div>
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-900 bg-neutral-500 flex items-center justify-center text-[9px] font-bold text-white">{extra}</div>
               </div>
          ) : (
               <div className="flex items-center -space-x-2">
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-900 bg-neutral-700"></div>
                  <div className="h-7 w-7 rounded-full border-2 border-neutral-900 bg-neutral-600"></div>
               </div>
          )}
          <div className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            <span className={`block h-1.5 w-1.5 rounded-full bg-emerald-500 ${parseInt(online) > 500 ? 'animate-pulse' : ''}`}></span> {online}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
          className={`w-full mt-4 py-2.5 border text-sm rounded-lg font-bold transition-colors text-center ${
            isJoined
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-white/5 border-white/10 hover:bg-white hover:text-black text-white'
          }`}
        >
          {isJoined ? 'Enter Room' : isPrivate ? 'Request Access' : 'Join Room'}
        </button>
      </div>
    </div>
  );
});
RoomCard.displayName = 'RoomCard';

const CreateSpaceCard = () => {
    const { openCreateModal } = useDashboard();
    return (
        <div onClick={openCreateModal} className="group relative overflow-hidden rounded-xl border-2 border-dashed border-neutral-800 bg-neutral-900/20 hover:bg-neutral-800/50 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer h-[340px] flex flex-col items-center justify-center gap-4 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/5 group-hover:border-emerald-500/30 group-hover:shadow-emerald-500/20">
                 <Icon name="add" className="text-4xl text-neutral-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="relative text-center z-10 px-6">
                 <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Create Space</h3>
                 <p className="text-sm text-neutral-500 leading-relaxed group-hover:text-neutral-300 transition-colors">
                    Launch a new anonymous zone.<br/>Topics, tags, and rules.
                 </p>
                 <div className="mt-4 px-4 py-1.5 rounded-full border border-neutral-700 text-neutral-500 text-xs font-bold uppercase tracking-wider group-hover:border-emerald-500/50 group-hover:text-emerald-500 transition-all bg-neutral-950/50">
                    Get Started
                 </div>
            </div>
        </div>
    );
};

const DashboardContent = () => {
  const { requests, handleRequestAction, refreshRooms } = useDashboard();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isTrendingOpen, setIsTrendingOpen] = useState(true);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPollIndex, setCurrentPollIndex] = useState(0);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchRooms = useCallback(async (category?: string, search?: string, pageNum = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoadingRooms(true);
    }
    try {
      const res = await roomsAPI.list(
        category && category !== 'all' ? category : undefined,
        search || undefined,
        pageNum,
        12
      );
      const { rooms: fetchedRooms, pagination } = res.data;
      setRooms(prev => append ? [...prev, ...fetchedRooms] : fetchedRooms);
      setHasMore(pagination.hasMore);
      setPage(pagination.page);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoadingRooms(false);
      setLoadingMore(false);
    }
  }, []);

  // Refresh user data on mount to ensure joinedRooms is always up-to-date
  // (fixes joined rooms not showing after navigating back from a room)
  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleCategoryFilter = useCallback((category: string) => {
    setActiveCategory(category);
    setPage(1);
    fetchRooms(category, searchQuery, 1, false);
  }, [fetchRooms, searchQuery]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    clearTimeout((window as any).__searchTimeout);
    (window as any).__searchTimeout = setTimeout(() => {
      setPage(1);
      fetchRooms(activeCategory, e.target.value, 1, false);
    }, 400);
  }, [activeCategory, fetchRooms]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchRooms(activeCategory, searchQuery, page + 1, true);
    }
  }, [loadingMore, hasMore, activeCategory, searchQuery, page, fetchRooms]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await roomsAPI.join(roomId);
      await refreshUser();
      await refreshRooms();
      navigate(`/room/${roomId}`);
    } catch (err: any) {
      console.error('Join room failed:', err);
    }
  };

  const categories = [
    { key: 'all', label: 'All Whispers' },
    { key: 'tech', label: '💻 Tech' },
    { key: 'social', label: '🎉 Social' },
    { key: 'confessions', label: '🤫 Confessions' },
    { key: 'study', label: '📚 Study' },
    { key: 'gaming', label: '🎮 Gaming' },
    { key: 'academic', label: '🎓 Academic' },
    { key: 'clubs', label: '🏛️ Clubs' },
    { key: 'memes', label: '😂 Memes' },
    { key: 'sports', label: '⚽ Sports' },
    { key: 'music', label: '🎵 Music' },
    { key: 'mental-health', label: '🧠 Mental Health' },
    { key: 'marketplace', label: '🛒 Marketplace' },
    { key: 'events', label: '📅 Events' },
    { key: 'careers', label: '💼 Careers' },
  ];

  const polls = [
    {
      id: 'nap-spot',
      question: 'Best spot for a nap?',
      options: [
        { id: 'student-center', text: 'Student Center Sofa', votes: 0 },
        { id: 'library-3rd', text: 'Library 3rd Floor', votes: 0 },
        { id: 'dorm', text: 'My dorm (boring)', votes: 0 },
      ]
    },
    {
      id: 'favorite-food',
      question: 'Campus dining hall favorite?',
      options: [
        { id: 'pizza', text: 'Pizza Day', votes: 0 },
        { id: 'sushi', text: 'Sushi Station', votes: 0 },
        { id: 'salad', text: 'Fresh Salads', votes: 0 },
        { id: 'burgers', text: 'Burgers & Fries', votes: 0 },
      ]
    },
    {
      id: 'study-time',
      question: 'When do you study best?',
      options: [
        { id: 'early-morning', text: 'Early morning (6-9 AM)', votes: 0 },
        { id: 'afternoon', text: 'Afternoon (12-5 PM)', votes: 0 },
        { id: 'late-night', text: 'Late night (10 PM-2 AM)', votes: 0 },
        { id: 'weekends', text: 'Weekends only', votes: 0 },
      ]
    },
    {
      id: 'campus-activity',
      question: 'Most exciting campus event?',
      options: [
        { id: 'football', text: 'Football games', votes: 0 },
        { id: 'concerts', text: 'Campus concerts', votes: 0 },
        { id: 'festivals', text: 'Cultural festivals', votes: 0 },
        { id: 'clubs', text: 'Club meetings', votes: 0 },
      ]
    }
  ];

  const currentPoll = polls[currentPollIndex];
  const totalVotes = currentPoll.options.reduce((sum, opt) => sum + (pollVotes[opt.id] || 0), 0);
  const hasVoted = userVotes.has(currentPoll.id);

  const handleVote = (optionId: string) => {
    if (hasVoted) return; // Prevent multiple votes
    
    setPollVotes(prev => ({
      ...prev,
      [optionId]: (prev[optionId] || 0) + 1
    }));
    setUserVotes(prev => new Set([...prev, currentPoll.id]));
  };

  const nextPoll = () => {
    setCurrentPollIndex((prev) => (prev + 1) % polls.length);
  };

  const getVotePercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round(((pollVotes[optionId] || 0) / totalVotes) * 100);
  };

  return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <header className="flex-shrink-0 px-8 py-6 z-10 bg-neutral-950/80 backdrop-blur-sm sticky top-0 border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Discover Campus</h2>
                <p className="text-neutral-500 mt-1">Join the conversation anonymously.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                      <Icon name="search" />
                  </span>
                  <input
                    type="text"
                    placeholder="Find your whisper..."
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-neutral-900 border border-white/5 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 text-sm shadow-sm transition-all text-white placeholder-neutral-600"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                {/* Notification Bell for Desktop */}
                <div className="relative hidden md:block" ref={notifRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`h-12 w-12 rounded-xl bg-neutral-900 border flex items-center justify-center transition-colors ${
                        showNotifications 
                          ? 'border-white/20 text-white bg-white/5' 
                          : 'border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                         <Icon name="notifications" />
                    </button>
                    {requests.length > 0 && (
                        <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-red-500 border-2 border-neutral-900 animate-pulse"></span>
                    )}
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <div className="absolute right-0 top-14 w-80 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in-up">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">Notifications</h4>
                          {requests.length > 0 && (
                            <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full text-xs font-bold">
                              {requests.length}
                            </span>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto scrollbar-hide">
                          {requests.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                              <Icon name="notifications_none" className="text-3xl text-neutral-600 mb-2 block mx-auto" />
                              <p className="text-sm text-neutral-500">No new notifications</p>
                            </div>
                          ) : (
                            requests.map((req) => (
                              <div key={req.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                                <div className="flex items-start gap-3">
                                  <UserAvatar name={req.user} size={32} />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white">
                                      <span className="font-bold">{req.user}</span>
                                      <span className="text-neutral-400"> wants to join </span>
                                      <span className="text-white/80 font-medium">{req.room}</span>
                                    </p>
                                    {req.role && (
                                      <span className="text-[10px] text-neutral-600 uppercase tracking-wide">{req.role}</span>
                                    )}
                                    <div className="flex items-center gap-2 mt-2">
                                      <button
                                        onClick={() => handleRequestAction(req.id, 'accept')}
                                        className="px-3 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20 transition-colors"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => handleRequestAction(req.id, 'reject')}
                                        className="px-3 py-1 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 transition-colors"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Mobile Toggle for Trending - Hidden on XL since we have sidebar */}
                <button 
                  onClick={() => setIsTrendingOpen(!isTrendingOpen)}
                  className="hidden xl:flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                  title={isTrendingOpen ? "Hide Trending" : "Show Trending"}
                >
                  <Icon name={isTrendingOpen ? "chevron_right" : "chevron_left"} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scroll">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => handleCategoryFilter(cat.key)}
                  className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-white text-black font-bold shadow-lg shadow-white/10'
                      : 'bg-neutral-900 border border-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-hide">
            {/* Pending Requests Section */}
            {requests.length > 0 && (
                <div className="mb-10 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-lg font-bold text-white">Pending Access Requests</h3>
                        <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-bold">{requests.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <UserAvatar name={req.user} size={40} />
                                    <div className="min-w-0">
                                        <h4 className="text-white font-bold text-sm truncate">{req.user}</h4>
                                        <p className="text-neutral-500 text-xs truncate">Wants to join <span className="text-white/70">{req.room}</span></p>
                                        {req.role && <span className="text-[10px] text-neutral-600 uppercase tracking-wide">{req.role}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button 
                                        onClick={() => handleRequestAction(req.id, 'accept')}
                                        className="h-8 w-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-all" 
                                        title="Accept"
                                    >
                                        <Icon name="check" size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleRequestAction(req.id, 'reject')}
                                        className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center transition-all" 
                                        title="Reject"
                                    >
                                        <Icon name="close" size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loadingRooms ? (
              <div className={`grid gap-6 ${isTrendingOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-neutral-900/50 rounded-xl border border-white/5 h-[340px] animate-pulse">
                    <div className="h-36 bg-neutral-800 rounded-t-xl" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-neutral-800 rounded w-3/4" />
                      <div className="h-4 bg-neutral-800 rounded w-full" />
                      <div className="h-4 bg-neutral-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-16 text-neutral-500">
                <Icon name="search_off" className="text-5xl mb-4 block mx-auto" />
                <p className="text-lg font-medium">No rooms found</p>
                <p className="text-sm mt-1">Create one to start a conversation!</p>
              </div>
            ) : (
              <>
                {/* Joined Rooms Section */}
                {(() => {
                  const joinedIds = new Set((user?.joinedRooms || []).map((r: any) => typeof r === 'string' ? r : r._id || r.id));
                  const joined = rooms.filter((r: any) => joinedIds.has(r._id || r.id));
                  const other = rooms.filter((r: any) => !joinedIds.has(r._id || r.id));
                  return (
                    <>
                      {joined.length > 0 && (
                        <div className="mb-10 animate-fade-in-up">
                          <div className="flex items-center gap-2 mb-5">
                            <Icon name="meeting_room" className="text-emerald-400" />
                            <h3 className="text-lg font-bold text-white">Your Rooms</h3>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs font-bold">{joined.length}</span>
                          </div>
                          <div className={`grid gap-6 ${isTrendingOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
                            {joined.map((room: any) => (
                              <RoomCard
                                key={room._id || room.id}
                                id={room._id || room.id}
                                title={room.name}
                                description={room.description || 'An anonymous room for campus chats.'}
                                image={room.image || getRoomImage(room.category)}
                                tag={room.category ? room.category.charAt(0).toUpperCase() + room.category.slice(1) : 'Social'}
                                online={String(room.onlineCount || 0)}
                                memberCount={room.memberCount || 0}
                                isPrivate={room.isPrivate}
                                isJoined={true}
                                onJoin={() => navigate(`/room/${room._id || room.id}`)}
                                onCardClick={() => navigate(`/room/${room._id || room.id}`)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Other Rooms Section */}
                      <div className="animate-fade-in-up">
                        {joined.length > 0 && (
                          <div className="flex items-center gap-2 mb-5">
                            <Icon name="explore" className="text-neutral-400" />
                            <h3 className="text-lg font-bold text-white">Explore Rooms</h3>
                            <span className="bg-white/5 text-neutral-400 border border-white/10 px-2 py-0.5 rounded-full text-xs font-bold">{other.length}</span>
                          </div>
                        )}
                        <div className={`grid gap-6 ${isTrendingOpen ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
                          {other.map((room: any) => (
                            <RoomCard
                              key={room._id || room.id}
                              id={room._id || room.id}
                              title={room.name}
                              description={room.description || 'An anonymous room for campus chats.'}
                              image={room.image || getRoomImage(room.category)}
                              tag={room.category ? room.category.charAt(0).toUpperCase() + room.category.slice(1) : 'Social'}
                              online={String(room.onlineCount || 0)}
                              memberCount={room.memberCount || 0}
                              isPrivate={room.isPrivate}
                              isJoined={false}
                              onJoin={() => handleJoinRoom(room._id || room.id)}
                              onCardClick={() => navigate(`/room/${room._id || room.id}`)}
                            />
                          ))}
                          <CreateSpaceCard />
                        </div>
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            {/* Load More Button */}
            {hasMore && !loadingRooms && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm font-bold hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Icon name="expand_more" />
                      Load More Rooms
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <aside 
          className={`
            hidden xl:flex flex-shrink-0 bg-neutral-900/50 border-l border-white/5 flex-col h-full z-10 
            transition-all duration-300 ease-in-out overflow-hidden
            ${isTrendingOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}
          `}
        >
          <div className="p-6 w-80">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Icon name="trending_up" className="text-neutral-400" /> Trending Topics
            </h3>
            <div className="space-y-6">
              {[
                { tag: '#FinalsWeek', posts: '2.4k posts', progress: '85%', desc: 'Library occupancy at 98%...' },
                { tag: '#LateNightEats', posts: '856 posts', progress: '65%', desc: 'Pizza truck spotted near dorms.' },
                { tag: '#CampusConcert', posts: '1.1k posts', progress: '45%' },
                { tag: '#RoommateDrama', posts: '342 posts', progress: '30%' },
              ].map((item) => (
                <div key={item.tag} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white group-hover:text-neutral-300 transition-colors">{item.tag}</span>
                    <span className="text-xs text-neutral-500">{item.posts}</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-white h-1.5 rounded-full" style={{ width: item.progress }}></div>
                  </div>
                  {item.desc && <p className="text-xs text-neutral-500 mt-2 line-clamp-1">{item.desc}</p>}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-white">Daily Poll</h4>
                <button
                  onClick={nextPoll}
                  className="text-xs text-neutral-500 hover:text-white transition-colors flex items-center gap-1"
                  title="Next poll"
                >
                  <Icon name="refresh" className="text-sm" />
                  Next
                </button>
              </div>
              <div className="p-4 rounded-xl bg-neutral-900 border border-white/5">
                <p className="text-sm text-neutral-300 mb-4 font-medium">{currentPoll.question}</p>
                <div className="space-y-2">
                  {currentPoll.options.map((option) => {
                    const percentage = getVotePercentage(option.id);
                    const isSelected = hasVoted && pollVotes[option.id] > 0;
                    
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={hasVoted}
                        className={`w-full text-left text-xs p-2.5 rounded-lg transition-all border relative overflow-hidden ${
                          hasVoted
                            ? isSelected
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                              : 'bg-black/40 text-neutral-500 border-transparent'
                            : 'bg-black/40 text-neutral-400 hover:bg-white hover:text-black border-transparent hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <span>{option.text}</span>
                          {hasVoted && (
                            <span className={`font-bold ${isSelected ? 'text-cyan-300' : 'text-neutral-500'}`}>
                              {percentage}%
                            </span>
                          )}
                        </div>
                        {hasVoted && (
                          <div 
                            className={`absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 transition-all duration-500 ${
                              isSelected ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {hasVoted && (
                  <p className="text-[10px] text-neutral-600 text-center mt-3">
                    {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
  );
}

const Dashboard = () => {
  return (
    <DashboardLayout>
       <DashboardContent />
    </DashboardLayout>
  );
};

export default Dashboard;
