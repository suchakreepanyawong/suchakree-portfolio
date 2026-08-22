'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin } from 'lucide-react';

const experiences = [
  {
    organization: 'National Cyber Security Agency (NCSA)',
    organizationTh: 'สำนักงานคณะกรรมการการรักษาความมั่นคงปลอดภัยไซเบอร์แห่งชาติ',
    title: 'Cybersecurity Assistance, Digital Forensics and Incident Response ThaiCERT Team',
    logo: '/images/exp/ncsa-logo.png',
    address: '120 หมู่ 3 อาคารซี ชั้น 7 ศูนย์ราชการเฉลิมพระเกียรติ 80 พรรษา 5 ธันวาคม 2550 ถนนแจ้งวัฒนะ แขวงทุ่งสองห้อง เขตหลักสี่ กรุงเทพฯ 10210',
    description: 'ร่วมงานกับหน่วยงานด้านความมั่นคงปลอดภัยไซเบอร์แห่งชาติ ดูแลโครงสร้างพื้นฐานไอทีและระบบรักษาความปลอดภัยขององค์กร',
    points: [
      'สนับสนุนการดูแลและบำรุงรักษาระบบเครือข่ายคอมพิวเตอร์และโครงสร้างพื้นฐานด้านไอทีขององค์กร',
      'ช่วยเฝ้าระวัง ตรวจสอบ และแก้ไขปัญหาเบื้องต้นเกี่ยวกับระบบรักษาความปลอดภัยทางไซเบอร์',
      'ให้คำปรึกษาและแก้ไขปัญหาการใช้งานอุปกรณ์คอมพิวเตอร์และระบบสารสนเทศแก่บุคลากรภายในหน่วยงาน',
    ],
  },
  {
    organization: 'Honda Logistic Asia Company',
    organizationTh: 'บริษัท ฮอนด้า โลจิสติก เอเชีย จำกัด',
    title: 'Technical Helper, IT Support and HelpDesk',
    tag: 'Enterprise IT',
    logo: '/images/exp/honda-logo.png',
    address: '1/56 ถนนโรจนะ ตำบลคานหาม อำเภออุทัย จังหวัดพระนครศรีอยุธยา 13210',
    description: 'ทำงานเกี่ยวกับการจัดการภายในองค์กร ด้านการบริหารต่าง ๆ การออกแบบระบบ และการวางแผนเกี่ยวกับองค์กร',
    points: [
      'ร่วมดูแลและออกแบบระบบการเดินเส้นทางของสายพานของบริษัท',
      'รองรับงาน HelpDesk และให้การสนับสนุนด้านไอทีแก่บุคลากรภายในองค์กร',
    ],
  },
  {
    organization: 'Fix It Center Uttaradit Technical',
    organizationTh: 'ศูนย์อาชีวะอาสาร่วมด้วยช่วยประชาชนวิลัยเทคนิคอุตรดิถต์',
    title: 'Technical Helper and IT Support',
    tag: 'Community Service',
    logo: '/images/exp/fixit-logo.png',
    address: '81 หมู่ 2 ถนนพาดวารี ตำบลป่าเซ่า อำเภอเมืองอุตรดิตถ์ อุตรดิตถ์ 53000',
    description: 'เปิดศูนย์ช่วยเหลือชาวบ้านตามภูมิลำเนา ซ่อมอุปกรณ์เครื่องใช้และติดตั้งระบบต่าง ๆ ให้ประชาชนทั่วไป',
    points: [
      'ซ่อมอุปกรณ์เครื่องใช้ ติดตั้งระบบทีวี เดินระบบสายแลนสำหรับอาคารและบ้านเรือนตามภูมิลำเนา',
      'สร้างแผงวงจรอิเล็กทรอนิกส์เพื่อประชาชนทั่วไป',
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="relative min-h-screen flex items-center py-28 overflow-hidden bg-white">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 w-full space-y-12">

        {/* Header */}
        <div className="space-y-3">
          <span className="section-badge">
            <Briefcase className="w-3.5 h-3.5 text-[#666666]" /> EXPERIENCE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#171717] tracking-[-0.04em]">
            Intern <span className="accent-text">Experience</span>
          </h2>
          <p className="text-[#666666] text-sm max-w-xl font-normal">
            Practical professional experience in IT support, cybersecurity operations, and community technical service.
          </p>
          <div className="glow-divider w-24" />
        </div>

        {/* Cards */}
        <div className="relative space-y-4 pl-8">
          {/* Timeline line */}
          <span className="absolute left-[6px] top-4 bottom-4 w-px bg-[#d4d4d4]" />
          {experiences.map((exp, idx) => (
            <motion.div
              key={exp.organization + exp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline dot */}
              <span className={`absolute left-[-32px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ring-4 ring-white z-10 ${idx === 0 ? 'border-emerald-500 bg-emerald-50' : 'border-[#171717] bg-white'}`} />
              <div className="vercel-card !border-[#cccccc] px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center gap-6 sm:gap-8">
                {/* Organization logo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.logo}
                    alt={`${exp.organization} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.visibility = 'hidden';
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[#171717] tracking-tight">
                    {exp.organization}
                  </h3>
                  <p className="text-sm font-semibold text-[#171717] pt-1">
                    {exp.organizationTh}
                  </p>
                  <div className="pt-8 text-sm text-[#666666]">
                    <p>{exp.title}</p>
                    {'address' in exp && exp.address && (
                      <p className="flex items-start gap-1.5 leading-relaxed pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#888888] shrink-0 mt-1" />
                        <span>{exp.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
