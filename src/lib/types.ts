export interface SocialLink {
  platform: string;
  label: string;
  url: string;
  color: string | null;
  sort_order: number;
}

export interface SkillItem {
  name: string;
  icon_url: string | null;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: SkillItem[];
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  tech_stack: string[];
  image_url: string | null;
  repo_url: string | null;
  live_url: string | null;
  show_visit?: boolean;
  show_github?: boolean;
  master_piece?: boolean;
  detail_url: string | null;
  sort_order: number;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  year: string | null;
  image_url: string | null;
  detail_url: string | null;
  description: string | null;
  featured?: boolean;
  sort_order: number;
}

export interface Activity {
  id: string;
  title: string;
  organizer: string;
  year: string | null;
  role: string | null;
  image_url: string | null;
  detail_url: string | null;
  description: string | null;
  featured?: boolean;
  sort_order: number;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  organization_th: string | null;
  title: string;
  tag: string | null;
  logo_url: string | null;
  address: string | null;
  description: string | null;
  points: string[];
  sort_order: number;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string | null;
  gpa: string | null;
  is_current: boolean;
  logo_url: string | null;
  sort_order: number;
}

export type SiteContent = Record<string, string>;

export interface PortfolioData {
  content: SiteContent;
  socialLinks: SocialLink[];
  skillCategories: SkillCategory[];
  projects: Project[];
  certificates: Certificate[];
  activities: Activity[];
  experiences: ExperienceItem[];
  education: EducationItem[];
}
