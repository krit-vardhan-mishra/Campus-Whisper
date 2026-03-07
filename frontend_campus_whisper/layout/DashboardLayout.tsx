import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { SettingsModal } from '../components/SettingsModal';
import { useAuth } from '../context/AuthContext';
import { roomsAPI } from '../services/api';
import { UserAvatar, getRoomImage, getInitials } from '../components/Avatars';

interface Request {
  id: number;
  user: string;
  room: string;
  avatar: string;
  role?: string;
}

interface JoinedRoom {
  _id: string;
  id: string;
  name: string;
  category: string;
  image: string;
  onlineCount: number;
  description: string;
}

interface DashboardContextType {
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  requests: Request[];
  handleRequestAction: (id: number, action: 'accept' | 'reject') => void;
  simulateNewRequest: () => void;
  joinedRooms: JoinedRoom[];
  refreshRooms: () => Promise<void>;
}

export const DashboardContext = React.createContext<DashboardContextType>({
  isCreateModalOpen: false,
  openCreateModal: () => {},
  closeCreateModal: () => {},
  requests: [],
  handleRequestAction: () => {},
  simulateNewRequest: () => {},
  joinedRooms: [],
  refreshRooms: async () => {},
});

export const useDashboard = () => useContext(DashboardContext);

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NavTooltip: React.FC<{ text: string; show: boolean }> = ({ text, show }) => {
  if (!show) return null;
  return (
    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow-lg border border-white/5 whitespace-nowrap z-50 animate-fade-in-up">
      {text}
      <div className="absolute top-1/2 -translate-y-1/2 -left-1 border-4 border-transparent border-r-neutral-800"></div>
    </div>
  );
};

const NotificationToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-20 right-4 z-50 animate-fade-in-up">
    <div className="bg-neutral-800 border border-emerald-500/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
        <Icon name="notifications_active" size={18} />
      </div>
      <div>
        <h4 className="text-sm font-bold">New Request</h4>
        <p className="text-xs text-neutral-400">{message}</p>
      </div>
      <button onClick={onClose} className="ml-2 text-neutral-500 hover:text-white">
        <Icon name="close" size={16} />
      </button>
    </div>
  </div>
);

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [joinedRooms, setJoinedRooms] = useState<JoinedRoom[]>([]);

  // Unified Request State (keep mock for demo since backend doesn't have request system)
  const [requests, setRequests] = useState<Request[]>([]);

  const handleRequestAction = (id: number, action: 'accept' | 'reject') => {
    setRequests(prev => prev.filter(req => req.id !== id));
    // Optional: show feedback toast
  };

  const openCreateModal = () => setCreateModalOpen(true);
  const closeCreateModal = () => setCreateModalOpen(false);

  const simulateNewRequest = () => {
    // Requests are kept as a demo feature since backend doesn't have a request system
  };

  // Fetch joined rooms from user data
  const refreshRooms = async () => {
    if (!user) return;
    try {
      // user.joinedRooms from /auth/me is populated
      if (user.joinedRooms && user.joinedRooms.length > 0) {
        const rooms = user.joinedRooms.map((r: any) => ({
          _id: r._id || r,
          id: r._id || r,
          name: r.name || 'Room',
          category: r.category || 'social',
          image: r.image || '',
          onlineCount: r.onlineCount || 0,
          description: r.description || '',
        }));
        setJoinedRooms(rooms);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshRooms();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const contextValue: DashboardContextType = {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    requests,
    handleRequestAction,
    simulateNewRequest,
    joinedRooms,
    refreshRooms,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="flex h-screen overflow-hidden bg-neutral-950 text-slate-300">
        {notification && <NotificationToast message={notification} onClose={() => setNotification(null)} />}
        
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-950/90 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-white to-neutral-400 rounded-lg flex items-center justify-center text-black">
                <Icon name="graphic_eq" className="text-lg" />
              </div>
              <h1 className="text-lg font-bold text-white">Campus Whisper</h1>
          </Link>
          <div className="flex items-center gap-3">
             {requests.length > 0 && (
                <div className="h-8 w-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <span className="text-xs font-bold">{requests.length}</span>
                </div>
             )}
             <button 
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-neutral-400 hover:text-white transition-colors"
            >
                <Icon name={isMobileMenuOpen ? "close" : "menu"} className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Sidebar Overlay for Mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <nav className={`
          fixed lg:static inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-neutral-900/50 transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
        `}>
          {/* Desktop Collapse Toggle */}
          <button
              onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex absolute -right-3 top-8 h-6 w-6 bg-neutral-800 border border-neutral-700 rounded-full items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors z-50"
          >
              <Icon name={isSidebarCollapsed ? "chevron_right" : "chevron_left"} size={16} />
          </button>

          <div className={`h-20 flex items-center px-6 border-b border-white/5 ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
            <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-white to-neutral-400 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <Icon name="graphic_eq" className="text-2xl" />
              </div>
              <h1 className={`text-xl font-bold tracking-tight text-white whitespace-nowrap transition-opacity duration-200 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                Campus<span className="text-neutral-500">Whisper</span>
              </h1>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-hide">
            
            {/* Requests Section in Sidebar */}
            {(!isSidebarCollapsed && requests.length > 0) && (
               <div className="px-4 animate-fade-in-up">
                  <div className="flex items-center justify-between px-2 mb-3">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                          Requests <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">{requests.length}</span>
                      </div>
                  </div>
                  <div className="space-y-2">
                      {requests.slice(0, 3).map(req => (
                          <div key={req.id} className="bg-neutral-800/40 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                              <div className="flex items-start gap-3 mb-3">
                                  <UserAvatar name={req.user} size={32} />
                                  <div className="min-w-0 flex-1">
                                      <p className="text-xs text-neutral-300 leading-snug">
                                          <span className="font-bold text-white block mb-0.5">{req.user}</span>
                                          wants to join <span className="text-white/80">{req.room}</span>
                                      </p>
                                  </div>
                              </div>
                              <div className="flex gap-2">
                                  <button 
                                      onClick={() => handleRequestAction(req.id, 'accept')}
                                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-bold transition-colors border border-emerald-500/20 hover:border-emerald-500/30 flex items-center justify-center gap-1"
                                  >
                                      <Icon name="check" size={14} /> Accept
                                  </button>
                                  <button 
                                      onClick={() => handleRequestAction(req.id, 'reject')}
                                      className="flex-1 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold transition-colors border border-red-500/20 hover:border-red-500/30 flex items-center justify-center gap-1"
                                  >
                                      <Icon name="close" size={14} /> Reject
                                  </button>
                              </div>
                          </div>
                      ))}
                      {requests.length > 3 && (
                          <div className="text-center text-[10px] text-neutral-500 italic">
                              + {requests.length - 3} more requests
                          </div>
                      )}
                  </div>
               </div>
            )}
            {isSidebarCollapsed && requests.length > 0 && (
                <div className="px-2 flex justify-center">
                    <div className="relative group">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 cursor-pointer">
                            <Icon name="person_add" />
                        </div>
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-black text-[10px] font-bold flex items-center justify-center border-2 border-neutral-900">
                            {requests.length}
                        </span>
                        <NavTooltip text={`${requests.length} Requests`} show={true} />
                    </div>
                </div>
            )}

            <div className="px-4">
              {!isSidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">Joined Rooms</div>}
              <div className="space-y-1">
                {joinedRooms.length > 0 ? joinedRooms.map((room) => (
                <Link
                  key={room._id}
                  to={`/room/${room._id}`}
                  className={`group flex items-center p-2 rounded-xl border transition-all duration-200 relative ${
                    location.pathname === `/room/${room._id}`
                      ? 'bg-white/10 text-white border-white/10'
                      : 'hover:bg-white/5 text-neutral-400 border-transparent hover:border-white/5 hover:text-white'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-lg object-cover grayscale opacity-80 group-hover:opacity-100"
                      src={room.image || getRoomImage(room.category)}
                      alt={room.name}
                    />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  </div>
                  {!isSidebarCollapsed && (
                      <>
                          <div className="ml-3 overflow-hidden">
                          <p className="text-sm font-bold truncate">{room.name}</p>
                          <p className="text-xs text-neutral-500 truncate group-hover:text-neutral-400">{room.onlineCount} online</p>
                          </div>
                          {room.onlineCount > 0 && (
                            <div className="ml-auto bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">{room.onlineCount}</div>
                          )}
                      </>
                  )}
                  <NavTooltip text={room.name} show={isSidebarCollapsed} />
                </Link>
                )) : (
                  <div className={`text-center py-4 text-neutral-600 text-xs ${isSidebarCollapsed ? 'hidden' : ''}`}>
                    No rooms joined yet
                  </div>
                )}
              </div>
              
              <button
                onClick={openCreateModal}
                className={`w-full mt-4 flex items-center p-2 rounded-xl border border-dashed border-neutral-800 text-neutral-500 hover:border-white hover:text-white transition-colors group relative ${isSidebarCollapsed ? 'justify-center' : ''}`}
                title="Create New Room"
              >
                <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Icon name="add" className="text-xl" />
                </div>
                {!isSidebarCollapsed && <span className="ml-3 text-sm font-medium">Create New Room</span>}
                <NavTooltip text="Create Room" show={isSidebarCollapsed} />
              </button>
            </div>
            
             <div className="px-4">
               {!isSidebarCollapsed && <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">Discover</div>}
               <nav className="space-y-1">
                  <Link to="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors relative ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Browse All">
                      <Icon name="explore" className="text-2xl lg:text-lg" />
                      {!isSidebarCollapsed && <span>Browse All</span>}
                      <NavTooltip text="Browse All" show={isSidebarCollapsed} />
                  </Link>
                  <button type="button" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors relative ${isSidebarCollapsed ? 'justify-center' : ''}`} title="Trending">
                      <Icon name="whatshot" className="text-2xl lg:text-lg" />
                      {!isSidebarCollapsed && <span>Trending</span>}
                      <NavTooltip text="Trending" show={isSidebarCollapsed} />
                  </button>
               </nav>
             </div>
          </div>

          <div className={`p-4 border-t border-white/5 bg-neutral-900/30 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className={`flex items-center p-2 rounded-xl hover:bg-white/5 transition-colors group relative ${isSidebarCollapsed ? 'w-auto justify-center' : 'w-full'}`}
            >
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-neutral-500 to-white p-[1px]">
                <div className="h-full w-full rounded-full bg-neutral-950 flex items-center justify-center overflow-hidden">
                  <UserAvatar name={user?.alias || 'User'} size={32} />
                </div>
              </div>
              {!isSidebarCollapsed && (
                  <>
                      <div className="ml-3 text-left overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{user?.alias || 'Anonymous'}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                          <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                      </p>
                      </div>
                      <Icon name="settings" className="ml-auto text-neutral-600 hover:text-white transition-colors" />
                  </>
              )}
              <NavTooltip text="Settings" show={isSidebarCollapsed} />
            </button>
          </div>
        </nav>

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950 relative pt-16 lg:pt-0 transition-all duration-300">
          {children}
        </main>

        <CreateRoomModal isOpen={isCreateModalOpen} onClose={closeCreateModal} refreshRooms={refreshRooms} />
        <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />
      </div>
    </DashboardContext.Provider>
  );
};
