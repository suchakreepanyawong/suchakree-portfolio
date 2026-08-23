import { createSupabaseServerClient } from '@/lib/supabase-server';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();

  const [
    certificatesRes,
    activitiesRes,
    projectsRes,
    experiencesRes,
    educationRes,
    skillsRes,
    categoriesRes,
    socialRes,
    contentRes,
  ] = await Promise.all([
    supabase.from('certificates').select('*').order('sort_order'),
    supabase.from('activities').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('experiences').select('*').order('sort_order'),
    supabase.from('education').select('*').order('sort_order'),
    supabase.from('skills').select('*').order('sort_order'),
    supabase.from('skill_categories').select('*').order('sort_order'),
    supabase.from('social_links').select('*').order('sort_order'),
    supabase.from('site_content').select('key,value').order('key'),
  ]);

  return (
    <DashboardClient
      data={{
        certificates: certificatesRes.data ?? [],
        activities: activitiesRes.data ?? [],
        projects: projectsRes.data ?? [],
        experiences: experiencesRes.data ?? [],
        education: educationRes.data ?? [],
        skills: skillsRes.data ?? [],
        skill_categories: categoriesRes.data ?? [],
        social_links: socialRes.data ?? [],
        site_content: Object.fromEntries((contentRes.data ?? []).map((r) => [r.key, r.value ?? ''])),
      }}
    />
  );
}
