export interface UserPreferences {
  theme: 'dark' | 'light' | 'emerald' | 'ruby' | 'ocean' | 'sunset' | 'forest' | 'lavender';
  favoriteTools: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Kept secure on backend, stripped on response
  preferences: UserPreferences;
  isAdmin?: boolean; // Admin privilege toggle flag
  role?: 'user' | 'admin' | 'owner'; // Account types: User, Admin, Owner
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  type: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  simulatedEmailSent: boolean;
}

export interface UtilityTool {
  id: string;
  name: string;
  desc: string;
  link: string;
  tags: string[];
  isInternalWorkspace?: boolean;
  accessType?: 'url' | 'file';
  uploadedFilename?: string;
  uploadedFilenames?: string[];
}

