export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };
  bodyStats: {
    height: string; // Display format (e.g., "6'4\"")
    heightCm: number; // For calculations
    bodyFat: number; // Percentage
    trackingSince: string; // Year started tracking
    lastUpdated: string; // ISO date string
  };
  achievements: string[];
  quote: string;
  isBlogAuthor: boolean;
}

export interface TeamData {
  team: TeamMember[];
  metadata: {
    lastUpdated: string;
    version: string;
  };
}