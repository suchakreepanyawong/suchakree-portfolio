'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Monitor, Database, Cloud, Cpu, Sparkles } from 'lucide-react';

const skillCategories = [
  {
    id: 'os',
    name: 'Operating Systems',
    icon: Monitor,
    skills: [
      { name: 'Windows', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg' },
      { name: 'Linux', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
      { name: 'Ubuntu', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ubuntu/ubuntu-plain.svg' },
      { name: 'Kali Linux', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kalilinux/kalilinux-original.svg' },
      { name: 'Debian', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/debian/debian-original.svg' },
      { name: 'Linux Mint', iconUrl: 'https://cdn.simpleicons.org/linuxmint/87CF3E' },
      { name: 'macOS (Basic)', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg' },
    ],
  },
  {
    id: 'languages-frameworks',
    name: 'Languages & Frameworks',
    icon: Code2,
    skills: [
      { name: 'HTML5', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
      { name: 'CSS3', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
      { name: 'JavaScript', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
      { name: 'TypeScript', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
      { name: 'Python', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
      { name: 'Lua', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg' },
      { name: 'C', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
      { name: 'C++', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
      { name: 'Java', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
      { name: 'Next.js', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
      { name: 'Node.js', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
      { name: 'shadcn/ui', iconUrl: 'https://cdn.simpleicons.org/shadcnui/171717' },
    ],
  },
  {
    id: 'databases-orm',
    name: 'Databases & Cache',
    icon: Database,
    skills: [
      { name: 'MySQL', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
      { name: 'MariaDB', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mariadb/mariadb-original.svg' },
      { name: 'PostgreSQL', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
      { name: 'MongoDB', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg' },
      { name: 'Prisma', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/prisma/prisma-original.svg' },
      { name: 'Redis', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
      { name: 'Firebase', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-original.svg' },
    ],
  },
  {
    id: 'cloud-devops',
    name: 'DevOps & Cloud',
    icon: Cloud,
    skills: [
      { name: 'Docker', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
      { name: 'Kubernetes', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg' },
      { name: 'AWS', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg' },
      { name: 'Cloudflare', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cloudflare/cloudflare-original.svg' },
      { name: 'Nginx', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg' },
      { name: 'Apache', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg' },
      { name: 'Ansible', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg' },
      { name: 'Grafana', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg' },
    ],
  },
  {
    id: 'ai-automation',
    name: 'AI, LLM & Automation',
    icon: Sparkles,
    skills: [
      { name: 'Ollama', iconUrl: 'https://cdn.simpleicons.org/ollama/171717' },
      { name: 'Dify.AI', iconUrl: 'https://cdn.simpleicons.org/probot/155EEF' },
      { name: 'n8n', iconUrl: 'https://cdn.simpleicons.org/n8n/EA4B71' },
      { name: 'RapidMiner', iconUrl: 'https://cdn.simpleicons.org/databricks/FF3621' },
    ],
  },
  {
    id: 'tools-hardware',
    name: 'Tools & Hardware',
    icon: Cpu,
    skills: [
      { name: 'Postman', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg' },
      { name: 'Arduino', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg' },
      { name: 'Obsidian', iconUrl: 'https://cdn.simpleicons.org/obsidian/7C3AED' },
      { name: 'Canva', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/canva/canva-original.svg' },
      { name: 'Figma', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
    ],
  },
];

export default function Skills() {

  return (
    <section id="skills" className="relative py-16 sm:py-20 overflow-hidden bg-[#fafafa]">
      {/* Ambient glow */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="space-y-2 flex flex-col items-center text-center">
          <span className="section-badge">
            <Code2 className="w-3.5 h-3.5 text-[#666666]" /> TECH STACK
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]">
            Skills & <span className="accent-text">Abilities</span>
          </h2>
          <p className="text-[#666666] text-sm max-w-lg font-normal">
            The technologies, languages, and specialized tools I leverage for software engineering and cyber defense.
          </p>
          <div className="glow-divider w-24" />
        </div>

        {/* Compact 2-column category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
          {skillCategories.map((category, catIdx) => {
            const CatIcon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
                className="rounded-2xl bg-white border border-[#cccccc] shadow-sm p-4 sm:p-5 space-y-3"
              >
                {/* Category Header */}
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#eaeaea]">
                  <div className="w-6 h-6 rounded-md bg-[#f0f0f0] border border-[#eaeaea] flex items-center justify-center text-[#171717]">
                    <CatIcon className="w-3.5 h-3.5 text-[#171717]" />
                  </div>
                  <h3 className="text-xs font-sans font-semibold tracking-wider text-[#171717] uppercase">
                    {category.name}
                  </h3>
                  <span className="text-[11px] font-sans text-[#888888] ml-auto">
                    {category.skills.length} tools
                  </span>
                </div>

                {/* Skill Badges Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.skills.map((skill, sIdx) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: sIdx * 0.02 }}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-[#fafafa] border border-[#ececec] hover:border-[#cccccc] hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      <div className="w-5 h-5 rounded-md bg-white border border-[#ebebeb] flex items-center justify-center p-0.5 shrink-0 group-hover:scale-105 transition-transform">
                        <img
                          src={skill.iconUrl}
                          alt={skill.name}
                          className="w-full h-full object-contain filter group-hover:brightness-95 transition-all"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#444444] group-hover:text-[#171717] truncate transition-colors">
                        {skill.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

