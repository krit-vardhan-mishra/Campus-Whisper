export interface User {
  id: string;
  name: string;
  avatar: string;
  handle: string;
  status: 'online' | 'offline' | 'away';
}

export interface Room {
  id: string;
  name: string;
  description: string;
  category: 'tech' | 'social' | 'confessions' | 'gaming' | 'study';
  onlineCount: number;
  image: string;
  tags?: string[];
  isPrivate?: boolean;
  lastActive?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string; // HTML or Markdown supported content
  timestamp: string;
  isMe: boolean;
  type: 'text' | 'code' | 'system' | 'image';
  metadata?: any;
}

export interface TrendingTopic {
  id: string;
  tag: string;
  posts: string; // e.g., "2.4k posts"
  description?: string;
  percentage: number;
}
