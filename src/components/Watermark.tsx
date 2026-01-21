'use client';

import Image from 'next/image';

export function Watermark() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
      <div className="relative w-[600px] h-[600px] opacity-[0.15]">
        <Image
          src="/watermark.png"
          alt=""
          fill
          className="object-contain"
          priority
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
