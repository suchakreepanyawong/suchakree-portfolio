import React from 'react';

/**
 * หัวข้อ section ที่รับชื่อจาก site_content — คำสุดท้ายถูกเน้นสีอัตโนมัติ
 * เช่น "Background & Education" → "Background & " ปกติ + "Education" สี accent
 */
export default function AccentTitle({ title, className }: { title: string; className?: string }) {
  const t = (title ?? '').trim();
  const spaceIdx = t.lastIndexOf(' ');
  const head = spaceIdx > 0 ? t.slice(0, spaceIdx + 1) : '';
  const tail = spaceIdx > 0 ? t.slice(spaceIdx + 1) : t;
  return (
    <h2 className={className}>
      {head}
      <span className="accent-text">{tail}</span>
    </h2>
  );
}
