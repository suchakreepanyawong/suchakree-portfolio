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

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Sections in Exact Requested Sequence */}
      <main className="flex-grow">
        {/* 1. Home (Hero) */}
        <Hero />

        {/* 2. About (includes Education) */}
        <About />

        {/* 3. Skills */}
        <Skills />

        {/* 4. Experience */}
        <Experience />

        {/* 5. Projects */}
        <Projects />

        {/* 6. Portfolio (Certificates & Activities) */}
        <Portfolio />

        {/* 7. Contact */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Scroll to top */}
      <ScrollToTop />
    </div>
  );
}
