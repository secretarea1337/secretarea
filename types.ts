
export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface Tool {
  name: string;
  icon?: string; // Icon name key
  category: 'mastered' | 'learning' | 'future';
  type?: '2d-3d' | 'render' | 'language' | 'security' | 'other';
}

export interface RoadmapStep {
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
  date?: string;
  icon?: string;
}

export interface MindMapNode {
  category: string;
  name: string;
  description: string;
  icon?: string;
}

export interface MindMapSection {
  title: string;
  description: string;
  nodes: MindMapNode[];
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Interest {
  name: string;
  icon: string;
}

export interface Project {
  title: string;
  description: string;
  tags: string[];
  images: string[]; 
  link?: string;
}

// Gaming Specific Types
export interface Game {
  name: string;
  image: string; // 3:4 aspect ratio URL
  status: 'played' | 'playing' | 'backlog';
}

export interface GamePlatform {
  platform: string;
  icon: string;
  games: Game[];
}

export interface GamingNewsItem {
  title: string;
  date: string;
  snippet: string;
  source: string;
}

export interface GameProcessStep {
  title: string;
  description: string;
  icon: string;
}

export interface GameDevToolInfo {
  name: string;
  type: 'Free' | 'Paid';
  description: string;
  icon?: string;
}

export interface GamingStat {
  year: string;
  arabGrowth: number; // percentage
  globalGrowth: number; // percentage
  avgSalaryArab: number; // USD
  avgSalaryGlobal: number; // USD
}

// Business Specific Types
export interface NexaService {
  title: string;
  description: string;
  price: string;
  discount?: string;
  category: string;
}

export interface NexaProject {
  title: string;
  description: string;
  category: 'web' | 'branding' | 'ai';
  image: string;
  // Detailed Popup Data
  gallery: string[];
  fullDescription: string;
  client: string;
  sales: string;
  delivery: string;
  revisions: string;
  included: string;
  includedDetails: string[];
  technologies: string;
}

export interface CategoryData {
  id: string;
  title: string;
  shortDescription: string;
  iconName: string; 
  color: string;
  role: string;
  bio: string;
  tools: Tool[];
  skills: Skill[];
  certificates: string[];
  certificatesDisclaimer?: string;
  projects: Project[];
  resources: { name: string; url: string; type: string }[];
  goals: string[];
  roadmap: RoadmapStep[];
  experience?: Experience[];
  education?: Education[];
  gallery?: string[];
  interests?: Interest[];
  services?: string[];
  mindMapDevelopment?: MindMapSection;
  mindMapCyberSecurity?: MindMapSection;
  // Gaming Specific Fields
  bestGames?: GamePlatform[];
  gamingNews?: GamingNewsItem[];
  gameBuildProcess?: GameProcessStep[];
  gameDevToolsList?: GameDevToolInfo[];
  gamingMarketStats?: GamingStat[];
  categorySocials?: { platform: string; url: string; icon: string }[];
  // Business Specific Fields
  nexaServices?: NexaService[];
  nexaProjects?: NexaProject[];
  nexaBusinessLinks?: { label: string; url: string; description: string }[];
}

export interface NavItem {
  label: string;
  path: string;
  iconName: string;
  isExternal?: boolean;
}
