import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { DashboardLayout } from '../layout/DashboardLayout';
import { socketService } from '../services/socket';
import { messagesAPI, roomsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserAvatar, getRoomImage, getInitials } from '../components/Avatars';
import { EditRoomModal } from '../components/EditRoomModal';

interface Message {
  id: number;
  user: string;
  time: string;
  timestamp: Date;
  initials: string;
  avatarColor: string;
  content: React.ReactNode | string;
  isMe?: boolean;
  isSystem?: boolean;
}

interface ChatNotification {
  id: string;
  type: 'user_joined' | 'user_left';
  userName: string;
  timestamp: Date;
  message: string;
}

const getDateLabel = (date: Date): string => {
  const now = new Date();
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = today.getTime() - msgDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
  return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const TypingIndicator = () => (
  <div className="flex items-center gap-1 h-3 px-2">
    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></div>
  </div>
);

const StickerPicker = ({ onSelectSticker, onClose, stickerPickerRef }: { 
  onSelectSticker: (sticker: string) => void; 
  onClose: () => void;
  stickerPickerRef: React.RefObject<HTMLDivElement>;
}) => {
  const stickers = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
    '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
    '😾', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
    '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'
  ];

  return (
    <div 
      ref={stickerPickerRef}
      className="absolute bottom-full left-0 mb-2 w-80 h-64 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4 z-50 animate-fade-in-up"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white">Stickers</h4>
        <button 
          onClick={onClose}
          className="text-neutral-500 hover:text-white transition-colors"
        >
          <Icon name="close" className="text-sm" />
        </button>
      </div>
      <div className="grid grid-cols-10 gap-2 overflow-y-auto h-48 scrollbar-hide">
        {stickers.map((sticker, index) => (
          <button
            key={index}
            onClick={() => onSelectSticker(sticker)}
            className="text-2xl hover:bg-white/10 rounded-lg p-1 transition-colors flex items-center justify-center h-10 w-10"
          >
            {sticker}
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatNotifications = ({ notifications, onClose, notifRef }: {
  notifications: ChatNotification[];
  onClose: () => void;
  notifRef: React.RefObject<HTMLDivElement>;
}) => {
  const formatNotificationTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      ref={notifRef}
      className="absolute right-0 top-14 w-80 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-fade-in-up"
    >
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h4 className="text-sm font-bold text-white">Room Activity</h4>
        {notifications.length > 0 && (
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-bold">
            {notifications.length}
          </span>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Icon name="notifications_none" className="text-3xl text-neutral-600 mb-2 block mx-auto" />
            <p className="text-sm text-neutral-500">No recent activity</p>
          </div>
        ) : (
          notifications
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((notif) => (
              <div key={notif.id} className="px-4 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border ${notif.type === 'user_joined' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    <Icon name={notif.type === 'user_joined' ? 'person_add' : 'person_remove'} className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-bold">{notif.userName}</span>
                      <span className="text-neutral-400"> {notif.message}</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatNotificationTime(notif.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
      {notifications.length > 5 && (
        <div className="px-4 py-2 border-t border-white/5 text-center">
          <button className="text-xs text-neutral-500 hover:text-white transition-colors">
            Clear all notifications
          </button>
        </div>
      )}
    </div>
  );
};

const ChatBubble: React.FC<Message> = ({ user, time, avatarColor, initials, isMe, isSystem, content }) => {
  if (isSystem) {
    return (
      <div className="flex justify-center my-4 animate-fade-in-up">
        <div className="text-xs text-neutral-500 bg-neutral-900 border border-white/5 px-4 py-1.5 rounded-full font-medium">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 max-w-[85%] sm:max-w-[70%] animate-fade-in-up ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
      {!isMe && (
        <div className="flex-shrink-0 mt-1">
          <UserAvatar name={user || 'Unknown'} size={32} />
        </div>
      )}
      <div className={`flex flex-col gap-1 ${isMe ? 'items-end' : ''}`}>
        <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-bold text-neutral-400">{isMe ? 'You' : user}</span>
          <span className="text-[10px] text-neutral-600">{time}</span>
        </div>
        <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed border ${
            isMe 
            ? 'bg-white text-black rounded-tr-sm border-white' 
            : 'bg-neutral-900 text-neutral-200 border-white/10 rounded-tl-sm'
        }`}>
           {typeof content === 'string' ? <p>{content}</p> : content}
        </div>
      </div>
    </div>
  );
};

const Chat = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const { user, refreshUser } = useAuth();
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [totalMessages, setTotalMessages] = useState(0);
  const [isPreview, setIsPreview] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [onlineCount, setOnlineCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const roomDetailsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Determine membership
  const isMember = room && user && room.members?.some(
    (m: any) => (m._id || m.id || m).toString() === (user.id || user._id)
  );

  const isAdmin = room && user && (
    room.admins?.some((a: any) => (a._id || a.id || a) === (user.id || user._id))
    || (room.createdBy?._id || room.createdBy?.id || room.createdBy) === (user.id || user._id)
  );

  // Fetch room info
  useEffect(() => {
    if (!roomId) return;
    const fetchRoom = async () => {
      try {
        const res = await roomsAPI.get(roomId);
        setRoom(res.data);
        setOnlineCount(res.data.onlineCount || 0);
      } catch (err) {
        console.error('Failed to fetch room:', err);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Fetch messages - either full (member) or preview (non-member)
  useEffect(() => {
    if (!roomId || !room) return;
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        if (isMember) {
          // Full paginated messages for members
          const res = await messagesAPI.get(roomId, 30);
          const data = res.data;
          const mapped: Message[] = (data.messages || []).map((msg: any) => {
            const ts = new Date(msg.timestamp || msg.createdAt);
            return {
              id: msg.id || msg._id,
              user: msg.userName,
              time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: ts,
              initials: getInitials(msg.userName),
              avatarColor: '',
              content: msg.content,
              isMe: msg.isMe,
              isSystem: msg.type === 'system',
            };
          });
          setMessages(mapped);
          setHasMoreMessages(data.hasMore || false);
          setTotalMessages(data.total || 0);
          setIsPreview(false);
        } else {
          // Limited preview for non-members
          const res = await messagesAPI.preview(roomId);
          const data = res.data;
          const mapped: Message[] = (data.messages || []).map((msg: any) => {
            const ts = new Date(msg.timestamp || msg.createdAt);
            return {
              id: msg.id || msg._id,
              user: msg.userName,
              time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: ts,
              initials: getInitials(msg.userName),
              avatarColor: '',
              content: msg.content,
              isMe: false,
              isSystem: msg.type === 'system',
            };
          });
          setMessages(mapped);
          setTotalMessages(data.totalMessages || 0);
          setIsPreview(true);
          setHasMoreMessages(false);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [roomId, room, isMember]);

  // Load older messages (pagination)
  const loadOlderMessages = async () => {
    if (!roomId || !hasMoreMessages || loadingOlder || !isMember) return;
    setLoadingOlder(true);
    try {
      const oldestMsg = messages.find(m => !m.isSystem);
      const before = oldestMsg?.timestamp?.toISOString();
      const res = await messagesAPI.get(roomId, 30, before);
      const data = res.data;
      const mapped: Message[] = (data.messages || []).map((msg: any) => {
        const ts = new Date(msg.timestamp || msg.createdAt);
        return {
          id: msg.id || msg._id,
          user: msg.userName,
          time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: ts,
          initials: getInitials(msg.userName),
          avatarColor: '',
          content: msg.content,
          isMe: msg.isMe,
          isSystem: msg.type === 'system',
        };
      });
      // Preserve scroll position
      const container = messagesContainerRef.current;
      const scrollHeightBefore = container?.scrollHeight || 0;
      
      setMessages(prev => [...mapped, ...prev]);
      setHasMoreMessages(data.hasMore || false);
      
      // Restore scroll position after prepending
      requestAnimationFrame(() => {
        if (container) {
          const scrollHeightAfter = container.scrollHeight;
          container.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }
      });
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  };

  // Handle join room from chat screen
  const handleJoinFromChat = async () => {
    if (!roomId || joiningRoom) return;
    setJoiningRoom(true);
    try {
      await roomsAPI.join(roomId);
      await refreshUser();
      // Refetch room to get updated members list
      const res = await roomsAPI.get(roomId);
      setRoom(res.data);
    } catch (err: any) {
      console.error('Join room failed:', err);
      alert(err.response?.data?.error || 'Failed to join room');
    } finally {
      setJoiningRoom(false);
    }
  };

  // Stable user ID for socket effect deps (avoids teardown on user object ref changes)
  const userId = user?.id || user?._id;

  // Socket: join room, listen for messages (only when member)
  useEffect(() => {
    if (!roomId || !isMember || !userId) return;

    socketService.joinRoom(roomId);

    const handleReceiveMessage = (msg: any) => {
      const ts = new Date(msg.timestamp || Date.now());
      const mapped: Message = {
        id: msg.id || Date.now(),
        user: msg.userName,
        time: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: ts,
        initials: getInitials(msg.userName || 'U'),
        avatarColor: '',
        content: msg.content,
        isMe: msg.userId === userId,
        isSystem: msg.type === 'system',
      };
      setMessages(prev => [...prev, mapped]);
    };

    const handleUserJoined = (data: any) => {
      setOnlineCount(data.onlineCount || 0);
      
      // Add notification
      const notification: ChatNotification = {
        id: `joined_${Date.now()}`,
        type: 'user_joined',
        userName: data.userName,
        timestamp: new Date(),
        message: 'joined the room'
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      
      const sysMsg: Message = {
        id: Date.now(),
        user: 'System',
        time: '',
        timestamp: new Date(),
        initials: '',
        avatarColor: '',
        content: `${data.userName} joined the room`,
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    const handleUserLeft = (data: any) => {
      setOnlineCount(data.onlineCount || 0);
      
      // Add notification
      const notification: ChatNotification = {
        id: `left_${Date.now()}`,
        type: 'user_left',
        userName: data.userName,
        timestamp: new Date(),
        message: 'left the room'
      };
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      
      const sysMsg: Message = {
        id: Date.now(),
        user: 'System',
        time: '',
        timestamp: new Date(),
        initials: '',
        avatarColor: '',
        content: `${data.userName} left the room`,
        isSystem: true,
      };
      setMessages(prev => [...prev, sysMsg]);
    };

    const handleUserTyping = (data: any) => {
      if (data.userId !== userId) {
        setTypingUser(data.userName);
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = (data: any) => {
      if (data.userId !== userId) {
        setIsTyping(false);
        setTypingUser('');
      }
    };

    socketService.on('receive_message', handleReceiveMessage);
    socketService.on('user_joined', handleUserJoined);
    socketService.on('user_left', handleUserLeft);
    socketService.on('user_typing', handleUserTyping);
    socketService.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socketService.off('receive_message', handleReceiveMessage);
      socketService.off('user_joined', handleUserJoined);
      socketService.off('user_left', handleUserLeft);
      socketService.off('user_typing', handleUserTyping);
      socketService.off('user_stop_typing', handleUserStopTyping);
      socketService.leaveRoom(roomId);
    };
  }, [roomId, userId, isMember]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
        searchInputRef.current.focus();
    }
    if (!showSearch) {
        setSearchQuery('');
    }
  }, [showSearch]);

  // Close sticker picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stickerPickerRef.current && !stickerPickerRef.current.contains(event.target as Node)) {
        setShowStickerPicker(false);
      }
    };

    if (showStickerPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStickerPicker]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Close room details dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roomDetailsRef.current && !roomDetailsRef.current.contains(event.target as Node)) {
        setShowRoomDetails(false);
      }
    };

    if (showRoomDetails) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoomDetails]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !roomId) return;

    socketService.sendMessage(newMessage.trim(), roomId);
    setNewMessage('');

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketService.emitStopTyping(roomId);
  };

  const handleStickerSelect = (sticker: string) => {
    setNewMessage(prev => prev + sticker);
    setShowStickerPicker(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (!roomId) return;

    // Emit typing
    socketService.emitTyping(roomId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping(roomId);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomId) return;
    if (!window.confirm('Are you sure you want to leave this room?')) return;
    setLeaveLoading(true);
    try {
      await roomsAPI.leave(roomId);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to leave room';
      if (err.response?.data?.code === 'LAST_ADMIN') {
        alert(errorMsg + '\n\nGo to Edit Room → Members tab to promote another member first.');
      } else {
        alert(errorMsg);
      }
    } finally {
      setLeaveLoading(false);
    }
  };

  // Simple string search for messages
  const filteredMessages = messages.filter(msg => {
      if (!searchQuery) return true;
      if (msg.isSystem) return false;
      // Heuristic search for demo purposes
      // Real implementation would inspect ReactNode children recursively or store raw text separately
      if (typeof msg.content === 'string') {
        return msg.content.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true; 
  });

  return (
    <>
    <DashboardLayout>
        <header className="h-20 px-6 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            {room ? (
              <img src={room.image || getRoomImage(room.category)} alt={room.name} className="h-12 w-12 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-cyan-900/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Icon name="school" className="text-2xl" />
              </div>
            )}
            
            {showSearch ? (
                <div className="flex-1 max-w-md animate-fade-in-up">
                    <div className="relative">
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            className="w-full bg-neutral-900 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-sm"
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
                        <button 
                            onClick={() => setShowSearch(false)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                            <Icon name="close" className="text-sm" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative group">
                    <div 
                        className="cursor-pointer"
                        onClick={() => setShowRoomDetails(!showRoomDetails)}
                    >
                        <h2 className="text-lg font-bold text-white leading-tight flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                            {room?.name || 'Loading...'}
                            <Icon name={showRoomDetails ? "expand_less" : "expand_more"} className="text-neutral-500" />
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span>{onlineCount} Online</span>
                            <span className="mx-1 text-neutral-700">•</span>
                            <span>{room?.category || ''}</span>
                        </div>
                    </div>
                    
                    {/* Dropdown Room Details */}
                    {showRoomDetails && (
                        <div 
                          ref={roomDetailsRef}
                          className="absolute top-full left-0 mt-4 w-72 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl p-4 z-30 animate-fade-in-up"
                        >
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-sm text-neutral-300 mb-4">
                                {room?.description || 'No description'}
                            </p>
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Tags</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {room?.tags?.length ? room.tags.map((tag: string, i: number) => (
                                  <span key={i} className={`px-2 py-1 rounded text-xs border ${i === 0 ? 'bg-cyan-900/30 text-cyan-400 border-cyan-800/50' : 'bg-neutral-800 text-neutral-400 border-white/5'}`}>#{tag}</span>
                                )) : <span className="text-xs text-neutral-500">No tags</span>}
                            </div>
                            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500">
                                <span>Admins: {room?.admins?.map((a: any) => a.alias || 'Unknown').join(', ') || room?.createdBy?.alias || 'Unknown'}</span>
                                <span>{room?.members?.length || 0} members</span>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => { setShowRoomDetails(false); setShowEditModal(true); }}
                                className="mt-3 w-full py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/20 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Icon name="edit" className="text-sm" />
                                Edit Room
                              </button>
                            )}
                        </div>
                    )}
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-1">
                 {isAdmin && (
                   <button
                     onClick={() => setShowEditModal(true)}
                     className="h-10 w-10 rounded-lg text-neutral-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center justify-center"
                     title="Edit Room"
                   >
                     <Icon name="edit" />
                   </button>
                 )}
                 {isMember && (
                   <button 
                      onClick={() => setShowSearch(!showSearch)}
                      className={`h-10 w-10 rounded-lg transition-colors flex items-center justify-center ${showSearch ? 'bg-cyan-500/10 text-cyan-400' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}
                  >
                      <Icon name="search" />
                  </button>
                 )}
                
                {/* Notification Bell - Admin only */}
                {isAdmin && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className={`h-10 w-10 rounded-lg transition-colors flex items-center justify-center relative ${
                        showNotifications 
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                          : 'text-neutral-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon name="notifications_none" />
                      {notifications.length > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border border-neutral-950 animate-pulse"></span>
                      )}
                    </button>
                    
                    {/* Notification Dropdown */}
                    {showNotifications && (
                      <ChatNotifications 
                        notifications={notifications}
                        onClose={() => setShowNotifications(false)}
                        notifRef={notifRef}
                      />
                    )}
                  </div>
                )}
             </div>
            {isMember && (
              <>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <button
                  onClick={handleLeaveRoom}
                  disabled={leaveLoading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors border border-red-500/10 hover:border-red-500/20 disabled:opacity-50"
                >
                  {leaveLoading ? (
                    <div className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                  ) : (
                    <Icon name="logout" className="text-lg" />
                  )}
                  <span className="hidden sm:inline">Leave Room</span>
                </button>
              </>
            )}
            {!isMember && (
              <>
                <div className="h-8 w-[1px] bg-white/10 mx-1"></div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 text-sm font-medium transition-colors border border-white/10"
                >
                  <Icon name="arrow_back" className="text-lg" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              </>
            )}
          </div>
        </header>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col bg-neutral-950">
          {/* Preview Banner for Non-Members */}
          {isPreview && !loadingMessages && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 animate-fade-in-up">
              <Icon name="visibility" className="text-amber-400 text-xl flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-200 font-medium">Preview Mode</p>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  You're seeing the last {messages.length} of {totalMessages} messages. Join this room to see all messages and participate in the conversation.
                </p>
              </div>
            </div>
          )}

          {/* Load More Button for Pagination */}
          {hasMoreMessages && isMember && !loadingMessages && (
            <div className="flex justify-center">
              <button
                onClick={loadOlderMessages}
                disabled={loadingOlder}
                className="px-5 py-2 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 text-xs font-bold hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loadingOlder ? (
                  <>
                    <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Icon name="expand_less" className="text-sm" />
                    Load Older Messages
                  </>
                )}
              </button>
            </div>
          )}

          {loadingMessages ? (
            <>
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex gap-3 max-w-[70%] animate-pulse ${i % 2 === 0 ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className="h-8 w-8 rounded-full bg-neutral-800 flex-shrink-0 mt-1" />
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-3 w-20 bg-neutral-800 rounded" />
                    <div className="h-16 bg-neutral-800 rounded-2xl" />
                  </div>
                </div>
              ))}
            </>
          ) : filteredMessages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon name="chat_bubble_outline" className="text-5xl text-neutral-700 mb-3" />
                <p className="text-neutral-500 text-sm">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const msgDate = msg.timestamp ? new Date(msg.timestamp) : null;
              const prevMsg = idx > 0 ? filteredMessages[idx - 1] : null;
              const prevDate = prevMsg?.timestamp ? new Date(prevMsg.timestamp) : null;

              let showDateSeparator = false;
              let dateLabel = '';
              if (msgDate) {
                if (!prevDate) {
                  showDateSeparator = true;
                  dateLabel = getDateLabel(msgDate);
                } else {
                  const msgDay = `${msgDate.getFullYear()}-${msgDate.getMonth()}-${msgDate.getDate()}`;
                  const prevDay = `${prevDate.getFullYear()}-${prevDate.getMonth()}-${prevDate.getDate()}`;
                  if (msgDay !== prevDay) {
                    showDateSeparator = true;
                    dateLabel = getDateLabel(msgDate);
                  }
                }
              }

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4">
                      <span className="px-3 py-1 bg-neutral-900 rounded-full text-xs font-medium text-neutral-500 border border-white/5">{dateLabel}</span>
                    </div>
                  )}
                  <ChatBubble {...msg} />
                </React.Fragment>
              );
            })
          )}

          {/* Typing Indicator */}
          {isTyping && (
             <div className="flex gap-3 max-w-[85%] sm:max-w-[70%] animate-fade-in-up">
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex-shrink-0 mt-1 flex items-center justify-center text-xs font-bold text-white border border-white/5">
                    <Icon name="more_horiz" size={16} />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-neutral-400 ml-1">{typingUser || 'Someone'} is typing...</span>
                    <div className="p-3 bg-neutral-900 text-neutral-400 border border-white/10 rounded-2xl rounded-tl-sm w-fit">
                        <TypingIndicator />
                    </div>
                </div>
             </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 sm:p-6 bg-neutral-950 border-t border-white/5">
          {isMember ? (
            <div className="flex flex-col gap-2 max-w-5xl mx-auto">
              <div className="relative flex items-end gap-3 bg-neutral-900 border border-white/5 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-white/20 focus-within:border-white/20 transition-all shadow-lg">
                <div className="relative flex-shrink-0">
                  <button 
                    onClick={() => setShowStickerPicker(!showStickerPicker)}
                    className={`p-2 transition-colors self-end mb-0.5 rounded-lg hover:bg-white/5 ${
                      showStickerPicker ? 'text-white bg-white/5' : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    <Icon name="sentiment_satisfied_alt" className="text-xl" />
                  </button>
                  {showStickerPicker && (
                    <StickerPicker 
                      onSelectSticker={handleStickerSelect}
                      onClose={() => setShowStickerPicker(false)}
                      stickerPickerRef={stickerPickerRef}
                    />
                  )}
                </div>
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className="w-full bg-transparent border-none text-white placeholder-neutral-500 resize-none focus:ring-0 py-3 max-h-32 text-sm leading-relaxed"
                  placeholder="Whisper something to the group..."
                  rows={1}
                />
                <div className="flex items-center gap-1 self-end pb-1">
                  <button 
                    onClick={handleSendMessage}
                    className="bg-white hover:bg-neutral-200 text-black p-2.5 rounded-xl shadow-lg shadow-white/5 transition-all active:scale-95 flex items-center justify-center group"
                  >
                    <Icon name="send" className="text-lg group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-neutral-600 text-center">Messages are encrypted and anonymous. Be kind.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="text-white font-bold text-sm mb-1">Join this room to participate</h4>
                  <p className="text-neutral-500 text-xs">You're viewing a preview. Join to send messages, see full history, and get real-time updates.</p>
                </div>
                <button
                  onClick={handleJoinFromChat}
                  disabled={joiningRoom}
                  className="px-8 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black text-sm font-bold transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50 whitespace-nowrap"
                >
                  {joiningRoom ? (
                    <>
                      <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Icon name="group_add" className="text-lg" />
                      Join Room
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </footer>
    </DashboardLayout>

    <EditRoomModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      room={room}
      onUpdated={(updated) => setRoom(updated)}
    />
    </>
  );
};

export default Chat;
