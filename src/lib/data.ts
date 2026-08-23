import { createServerClient } from '@/lib/supabase';
import type {
  Activity,
  Certificate,
  EducationItem,
  ExperienceItem,
  PortfolioData,
  Project,
  SiteContent,
  SkillCategory,
  SkillItem,
  SocialLink,
} from '@/lib/types';

/**
 * ดึงข้อมูลทั้งหมดสำหรับหน้าเว็บ — เรียกจาก server component ตอน build
 * ผลลัพธ์ถูก bake ลง static HTML (เร็วสุด) และ revalidate เมื่อแก้ไขจาก Dashboard
 */
export async function getPortfolioData(): Promise<PortfolioData> {
  const supabase = createServerClient();

  const [
    contentRes,
    socialRes,
    categoriesRes,
    skillsRes,
    projectsRes,
    certificatesRes,
    activitiesRes,
    experiencesRes,
    educationRes,
  ] = await Promise.all([
    supabase.from('site_content').select('key,value'),
    supabase.from('social_links').select('platform,label,url,color,sort_order').order('sort_order'),
    supabase.from('skill_categories').select('id,name,icon,sort_order').order('sort_order'),
    supabase.from('skills').select('category_id,name,icon_url,sort_order').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('certificates').select('*').order('sort_order'),
    supabase.from('activities').select('*').order('sort_order'),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
  ]);

  const content: SiteContent = {};
  for (const row of contentRes.data ?? []) {
    content[row.key] = row.value ?? '';
  }

  const categories: SkillCategory[] = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    skills: (skillsRes.data ?? [])
      .filter((s) => s.category_id === c.id)
      .map<SkillItem>((s) => ({ name: s.name, icon_url: s.icon_url })),
  }));

  return {
    content,
    socialLinks: socialRes.data ?? [],
    skillCategories: categories,
    projects: (projectsRes.data ?? []) as Project[],
    certificates: (certificatesRes.data ?? []) as Certificate[],
    activities: (activitiesRes.data ?? []) as Activity[],
    experiences: (experiencesRes.data ?? []) as ExperienceItem[],
    education: (educationRes.data ?? []) as EducationItem[],
  };
}
