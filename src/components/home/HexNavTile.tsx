'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ComponentType } from 'react';

interface HexNavTileProps {
  label: string;
  icon: string;
  href: string;
}

export function HexNavTile({ label, icon: Icon, href }: HexNavTileProps) {
  const HEX_W = 108;
  const HEX_H = 118;
  const HEX_H_SCALED = HEX_H * 0.88; // 104

  return (
    <Link href={href}>
      <div
        className="flex flex-col items-center cursor-pointer group"
        style={{ width: HEX_W + 8 }}
      >
        {/* Shadow and SVG container */}
        <div
          className="relative flex items-center justify-center transition-transform hover:scale-105"
          style={{
            width: HEX_W,
            height: HEX_H_SCALED,
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))',
          }}
        >
          {/* Hexagon SVG */}
          <svg
            width={HEX_W}
            height={HEX_H_SCALED}
            viewBox="0 0 108 100"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
            }}
            className="w-full h-full"
          >
            <polygon
              points="54,6 98,32 98,74 54,98 10,74 10,32"
              fill="#FFFFFF"
              stroke="#E8E4E0"
              strokeWidth={1}
            />
          </svg>

          {/* Icon layer */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ paddingBottom: 6 }}
          >
            <Image alt='' src={Icon} width={34} height={34} />
          </div>
        </div>

        {/* Label */}
        <p
          className="mt-2 text-sm font-semibold text-[#1A3F6C]"
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          {label}
        </p>
      </div>
    </Link>
  );
}
