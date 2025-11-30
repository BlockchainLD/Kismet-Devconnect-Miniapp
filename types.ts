import { CSSProperties } from 'react';

export type ArtistId = 
  | 'qab' 
  | 'gressie' 
  | 'noistruct' 
  | 'sulkian' 
  | 'kathonejo' 
  | 'arbstein' 
  | 'sato' 
  | 'alva' 
  | 'pinkyblue';

export interface Artwork {
  id: string;
  title: string;
  imageUrl: string; 
  description?: string;
  zoraLink?: string; // Link to buy the specific NFT
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  farcaster?: string;
}

export interface Artist {
  id: ArtistId;
  name: string;
  shortDescription: string; 
  profileImage?: string;
  creatorCoinLink?: string; // Link to buy the creator coin
  creatorCoinAddress?: string; // Token address for in-app swapping
  mainArtwork: Artwork;
  gallery: Artwork[];
  socials?: SocialLinks;
}

export interface ThemeConfig {
  id: ArtistId;
  // Tailswind classes
  bgClass: string;
  textClass: string;
  fontClass: string;
  borderClass: string;
  buttonClass: string;
  // Framer motion variants identifier
  motionType: 'pop' | 'ethereal' | 'mechanic' | 'glitch' | 'float' | 'elastic' | 'sketch' | 'radial' | 'pixel';
  // Specific CSS styles for things Tailwind can't do easily
  customStyle?: CSSProperties;
}

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  location?: {
    placeId: string;
    description: string;
  };
  custodyAddress?: string;
  verifications?: string[];
}

export interface FarcasterContextType {
  user: FarcasterUser | null;
  isLoaded: boolean;
  isContextLoaded: boolean;
  isConnected: boolean;
}