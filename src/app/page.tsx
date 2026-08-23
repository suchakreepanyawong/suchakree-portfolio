import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Portfolio from '@/components/Portfolio';
import Projects from '@/components/Projects';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { getPortfolioData } from '@/lib/data';

export default async function Home() {
  const data = await getPortfolioData();

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Sections in Exact Requested Sequence */}
      <main className="flex-grow">
        {/* 1. Home (Hero) */}
        <Hero
          socialLinks={data.socialLinks}
          typedText={data.content.hero_typed_text ?? ''}
        />

        {/* 2. About (includes Education) */}
        <About content={data.content} education={data.education} />

        {/* 3. Skills */}
        <Skills categories={data.skillCategories} />

        {/* 4. Experience */}
        <Experience experiences={data.experiences} />

        {/* 5. Projects */}
        <Projects projects={data.projects} />

        {/* 6. Portfolio (Certificates & Activities) */}
        <Portfolio certificates={data.certificates} activities={data.activities} />

        {/* 7. Contact */}
        <Contact socialLinks={data.socialLinks} email={data.content.contact_email ?? ''} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
