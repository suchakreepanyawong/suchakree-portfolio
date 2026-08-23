-- ============================================================
-- Suchakree Portfolio — Supabase schema + RLS + Storage + seed
-- Run once in Supabase SQL Editor
-- ============================================================

-- ---------- TABLES ----------

create table if not exists site_content (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

create table if not exists social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,            -- slug เช่น github, linkedin
  label text not null,
  url text not null,
  color text,                        -- hex ไม่มี #
  sort_order int default 0
);

create table if not exists skill_categories (
  id text primary key,               -- 'os', 'languages-frameworks', ...
  name text not null,
  icon text not null,                -- ชื่อ icon จาก lucide-react
  sort_order int default 0
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  category_id text references skill_categories(id) on delete cascade,
  name text not null,
  icon_url text,
  sort_order int default 0
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,                     -- badge เช่น CYBERSECURITY
  tech_stack text[] default '{}',
  image_url text,
  repo_url text,
  live_url text,
  detail_url text,                   -- ลิงก์ดูรายละเอียดโปรเจกต์
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  year text,
  image_url text,
  detail_url text,                   -- ลิงก์ซ่อนในตัวหนังสือ (verify / credly)
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer text not null,
  year text,
  role text,
  image_url text,
  detail_url text,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  organization_th text,
  title text not null,
  tag text,
  logo_url text,
  address text,
  description text,
  points text[] default '{}',
  sort_order int default 0
);

create table if not exists education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  period text,
  gpa text,
  is_current boolean default false,
  logo_url text,
  sort_order int default 0
);

-- ---------- ROW LEVEL SECURITY ----------

alter table site_content    enable row level security;
alter table social_links    enable row level security;
alter table skill_categories enable row level security;
alter table skills          enable row level security;
alter table projects        enable row level security;
alter table certificates    enable row level security;
alter table activities      enable row level security;
alter table experiences     enable row level security;
alter table education       enable row level security;

-- อ่านได้ทุกคน (หน้าเว็บ) / เขียนได้เฉพาะผู้ที่ล็อกอิน (คุณคนเดียว)
do $$
declare t text;
begin
  foreach t in array array['site_content','social_links','skill_categories','skills','projects','certificates','activities','experiences','education']
  loop
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "auth insert" on %I for insert to authenticated with check (true)', t);
    execute format('create policy "auth update" on %I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "auth delete" on %I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- ---------- STORAGE ----------

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "public read portfolio bucket"
on storage.objects for select
using (bucket_id = 'portfolio');

create policy "auth upload portfolio bucket"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio');

create policy "auth update portfolio bucket"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio');

create policy "auth delete portfolio bucket"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio');

-- ---------- SEED DATA (ย้ายจากโค้ด hardcode ทั้งหมด) ----------

insert into site_content (key, value) values
  ('hero_name', 'Suchakree Panyawong'),
  ('hero_badge', 'Available for opportunities'),
  ('hero_typed_text', 'Bachelor of Engineering student in Computer Engineering at Rajamangala University of Technology Lanna.'),
  ('about_full_name', 'Suchakree Panyawong'),
  ('about_nickname', 'Team'),
  ('about_nationality', 'Thai'),
  ('about_location', 'Chiang Mai, Thailand'),
  ('about_languages', 'Thai (Native), English (Intermediate), Chinese (Beginner)'),
  ('about_photo', '/images/profile-2.png'),
  ('contact_email', 'Suchakree.panyawong@gmail.com')
on conflict (key) do update set value = excluded.value;

insert into social_links (platform, label, url, color, sort_order) values
  ('github', 'GitHub', 'https://github.com/suchakree-panyawong', '181717', 1),
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/in/suchakree-panyawong-9682ab330/', '0A66C2', 2),
  ('medium', 'Medium', 'https://medium.com/@suchakree.panyawong', '000000', 3),
  ('credly', 'Credly', 'https://www.credly.com/users/suchakree-panyawong/edit/badges/credly', 'FF6B00', 4),
  ('researchgate', 'ResearchGate', 'https://www.researchgate.net/profile/Suchakree-Panyawong', '00CCBB', 5);

insert into skill_categories (id, name, icon, sort_order) values
  ('os', 'Operating Systems', 'Monitor', 1),
  ('languages-frameworks', 'Languages & Frameworks', 'Code2', 2),
  ('databases-orm', 'Databases & Cache', 'Database', 3),
  ('cloud-devops', 'DevOps & Cloud', 'Cloud', 4),
  ('ai-automation', 'AI, LLM & Automation', 'Sparkles', 5),
  ('tools-hardware', 'Tools & Hardware', 'Cpu', 6)
on conflict (id) do nothing;

insert into skills (category_id, name, icon_url, sort_order) values
  ('os','Windows','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg',1),
  ('os','Linux','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',2),
  ('os','Ubuntu','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg',3),
  ('os','Kali Linux','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kalilinux/kalilinux-original.svg',4),
  ('os','Debian','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg',5),
  ('os','Linux Mint','https://cdn.simpleicons.org/linuxmint/87CF3E',6),
  ('os','macOS (Basic)','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',7),
  ('languages-frameworks','HTML5','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',1),
  ('languages-frameworks','CSS3','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',2),
  ('languages-frameworks','JavaScript','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',3),
  ('languages-frameworks','TypeScript','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',4),
  ('languages-frameworks','Python','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',5),
  ('languages-frameworks','Lua','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg',6),
  ('languages-frameworks','C','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',7),
  ('languages-frameworks','C++','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',8),
  ('languages-frameworks','Java','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',9),
  ('languages-frameworks','Next.js','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg',10),
  ('languages-frameworks','Node.js','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',11),
  ('languages-frameworks','shadcn/ui','https://cdn.simpleicons.org/shadcnui/171717',12),
  ('databases-orm','MySQL','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',1),
  ('databases-orm','MariaDB','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg',2),
  ('databases-orm','PostgreSQL','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',3),
  ('databases-orm','MongoDB','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',4),
  ('databases-orm','Prisma','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg',5),
  ('databases-orm','Redis','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',6),
  ('databases-orm','Firebase','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg',7),
  ('cloud-devops','Docker','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',1),
  ('cloud-devops','Kubernetes','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',2),
  ('cloud-devops','AWS','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',3),
  ('cloud-devops','Cloudflare','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg',4),
  ('cloud-devops','Nginx','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg',5),
  ('cloud-devops','Apache','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg',6),
  ('cloud-devops','Ansible','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg',7),
  ('cloud-devops','Grafana','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg',8),
  ('ai-automation','Ollama','https://cdn.simpleicons.org/ollama/171717',1),
  ('ai-automation','Dify.AI','https://cdn.simpleicons.org/probot/155EEF',2),
  ('ai-automation','n8n','https://cdn.simpleicons.org/n8n/EA4B71',3),
  ('ai-automation','RapidMiner','https://cdn.simpleicons.org/databricks/FF3621',4),
  ('tools-hardware','Postman','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',1),
  ('tools-hardware','Arduino','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',2),
  ('tools-hardware','Obsidian','https://cdn.simpleicons.org/obsidian/7C3AED',3),
  ('tools-hardware','Canva','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg',4),
  ('tools-hardware','Figma','https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',5);

insert into projects (title, description, category, tech_stack, sort_order) values
  ('Cyber Scammer Shield',
   'Anti-phishing and SMS scam detection system designed to identify web security vulnerabilities and protect users from fraudulent links.',
   'CYBERSECURITY',
   array['Python','FastAPI','Regex Engine','Scam DB'], 1),
  ('Suchakree Assistant RAG',
   'Personal enterprise AI assistant powered by self-hosted LLMs and retrieval-augmented generation for real-time document search and technical queries.',
   'AI / RAG PIPELINE',
   array['Next.js','LangChain','ChromaDB','Ollama'], 2);

insert into certificates (title, issuer, year, sort_order) values
  ('Fortinet Certified Fundamentals (FCF) in Cybersecurity', 'Fortinet Training Institute', '2024', 1),
  ('Fortinet Certified Associate (FCA) & FortiGate Operator', 'Fortinet Training Institute', '2025', 2),
  ('Applied Big Data & AI Technologies Certification', 'Ministry of Digital Economy', '2024', 3),
  ('IC3 Digital Literacy Master Certification', 'Certiport / Global Standard', '2024', 4),
  ('Network Security Associate & Threat Defense', 'Cyber Academy Institute', '2024', 5),
  ('Cloud Infrastructure & Linux Server Administration', 'Open Cloud Training', '2024', 6),
  ('Enterprise Network Cabling & Fiber Optics Spec', 'Link Certified Engineering', '2023', 7),
  ('Vulnerability Assessment & Web Defense Fundamentals', 'National Cyber Security Hub', '2024', 8),
  ('Generative AI & LLM Deployment Fundamentals', 'AI Research Alliance', '2025', 9),
  ('Cisco Certified Support Technician (CCST) Cybersecurity', 'Cisco Networking Academy', '2024', 10),
  ('Linux Professional Institute LPIC-1 System Administrator', 'Linux Professional Institute', '2024', 11),
  ('Certified Secure Software Lifecycle Specialist', 'OWASP Foundation Chapter', '2025', 12),
  ('AWS Certified Cloud Practitioner (CLF-C02)', 'Amazon Web Services', '2024', 13),
  ('Red Hat Certified Enterprise Application Specialist', 'Red Hat Academy', '2024', 14),
  ('Prompt Engineering & Autonomous AI Agent Mastery', 'DeepLearning.AI Hub', '2025', 15);

insert into activities (title, organizer, year, role, sort_order) values
  ('Thailand National Cyber Exercise 2025', 'NCSA / Cyber Security Agency', '2025', 'Defense Operative', 1),
  ('CTF Bootcamp & Hack The Scammer CTF', 'Cyber Defense Training', '2025', 'Competitor', 2),
  ('WAZUH Security Data Protection Workshop', 'Cyber Security Training Center', '2024', 'Participant', 3),
  ('Cabling Contest Training & Network Engineering', 'Link Certified Network Engineering', '2024', 'Trainee', 4),
  ('Student Cybersecurity Leadership & Outreach Camp', 'University Cyber Club', '2024', 'Coordinator', 5),
  ('Local AI & Open Source Model Hackathon', 'Tech Innovators Guild', '2025', 'Developer', 6),
  ('Cyber Threat Intelligence Gathering Seminar', 'Thai Cyber Network', '2024', 'Attendee', 7),
  ('Network Hardware Lab & Server Assembly Workshop', 'Engineering Faculty', '2023', 'Lead Assistant', 8),
  ('Digital Forensic & Incident Response Challenge', 'InfoSec Thailand', '2024', 'Competitor', 9),
  ('Regional University CTF Cybersecurity Competition', 'Northern Cyber League', '2024', 'Team Captain', 10),
  ('Autonomous RAG & AI Agent Builders Meetup', 'AI Thailand Community', '2025', 'Speaker & Builder', 11),
  ('DevSecOps & Secure CI/CD Pipeline Hands-on Lab', 'Cloud Security Alliance', '2024', 'Participant', 12),
  ('Ethical Hacking & Web Penetration Testing Camp', 'Security Research Club', '2025', 'Trainer Assistant', 13),
  ('Open Source Linux Kernel & Server Tuning Expo', 'Thai Linux Users Group', '2024', 'Contributor', 14),
  ('Smart IoT & Embedded Hardware Innovation Fair', 'Robotics & IoT Lab', '2023', 'Exhibitor', 15);

insert into experiences (organization, organization_th, title, tag, logo_url, address, description, points, sort_order) values
  ('National Cyber Security Agency (NCSA)',
   'สำนักงานคณะกรรมการการรักษาความมั่นคงปลอดภัยไซเบอร์แห่งชาติ',
   'Cybersecurity Assistance, Digital Forensics and Incident Response ThaiCERT Team',
   null,
   '/images/exp/ncsa-logo.png',
   '120 หมู่ 3 อาคารซี ชั้น 7 ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษา 5 ธันวาคม 2550 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210',
   'ร่วมงานกับหน่วยงานด้านความมั่นคงปลอดภัยไซเบอร์แห่งชาติ ดูแลโครงสร้างพื้นฐานไอทีและระบบรักษาความปลอดภัยขององค์กร',
   array['สนับสนุนการดูแลและบำรุงรักษาระบบเครือข่ายคอมพิวเตอร์และโครงสร้างพื้นฐานด้านไอทีขององค์กร','ช่วยเฝ้าระวัง ตรวจสอบ และแก้ไขปัญหาเบื้องต้นเกี่ยวกับระบบรักษาความปลอดภัยทางไซเบอร์','ให้คำปรึกษาและแก้ไขปัญหาการใช้งานอุปกรณ์คอมพิวเตอร์และระบบสารสนเทศแก่บุคลากรภายในหน่วยงาน'],
   1),
  ('Honda Logistic Asia Company',
   'บริษัท ฮอนด้า โลจิสติก เอเชีย จำกัด',
   'Technical Helper, IT Support and HelpDesk',
   'Enterprise IT',
   '/images/exp/honda-logo.png',
   '1/56 ถนนโรจนะ ตำบลคานหาม อำเภออุทัย จังหวัดพระนครศรีอยุธยา 13210',
   'ทำงานเกี่ยวกับการจัดการภายในองค์กร ด้านการบริหารต่าง ๆ การออกแบบระบบ และการวางแผนเกี่ยวกับองค์กร',
   array['ร่วมดูแลและออกแบบระบบการเดินเส้นทางของสายพานของบริษัท','รองรับงาน HelpDesk และให้การสนับสนุนด้านไอทีแก่บุคลากรภายในองค์กร'],
   2),
  ('Fix It Center Uttaradit Technical',
   'ศูนย์อาชีวะอาสาร่วมด้วยช่วยประชาชนวิลัยเทคนิคอุตรดิถต์',
   'Technical Helper and IT Support',
   'Community Service',
   '/images/exp/fixit-logo.png',
   '81 หมู่ 2 ถนนพาดวารี ตำบลป่าเซ่า อำเภอเมืองอุตรดิตถ์ อุตรดิตถ์ 53000',
   'เปิดศูนย์ช่วยเหลือชาวบ้านตามภูมิลำเนา ซ่อมอุปกรณ์เครื่องใช้และติดตั้งระบบต่าง ๆ ให้ประชาชนทั่วไป',
   array['ซ่อมอุปกรณ์เครื่องใช้ ติดตั้งระบบทีวี เดินระบบสายแลนสำหรับอาคารและบ้านเรือนตามภูมิลำเนา','สร้างแผงวงจรอิเล็กทรอนิกส์เพื่อประชาชนทั่วไป'],
   3);

insert into education (institution, degree, period, gpa, is_current, logo_url, sort_order) values
  ('Rajamangala University of Technology Lanna', 'Bachelor of Engineering — Computer Engineering', '2023 — 2026', '—', true, '/images/edu/rmutl-logo.png', 1),
  ('Uttaradit Technical College', 'High Vocational Certificate — Mechatronics & Robotics', '2021 — 2022', '—', false, '/images/edu/utc-logo.png', 2),
  ('Uttaradit Technical College', 'Vocational Certificate — Electronics', '2018 — 2020', '—', false, '/images/edu/utc-logo.png', 3),
  ('Uttaradit School', 'Secondary Education', '2015 — 2017', '—', false, '/images/edu/uttaradit.png', 4);
