
export enum Tool {
  DASHBOARD = 'DASHBOARD',
  CHAT = 'CHAT',
  CREATIVE = 'CREATIVE',
  EXPLORE = 'EXPLORE'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: Date;
}

export interface SearchResult {
  title: string;
  uri: string;
}
