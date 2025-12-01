"use client";

import React, { useId } from "react";

interface Props {
  className?: string;
}

export default function RobotIcon({ className }: Props) {
  const id = useId();
  const gradId = `robotGradient-${id.replace(/[:.]/g, "-")}`;

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      <rect x="12" y="20" width="40" height="36" rx="10" fill={`url(#${gradId})`} />
      <rect x="22" y="12" width="20" height="8" rx="4" fill="#F4A62A" />
      <circle cx="12" cy="18" r="4" fill="#4FC3F7" />
      <rect x="10" y="18" width="4" height="28" rx="2" fill="#4FC3F7" />
      <circle cx="52" cy="18" r="4" fill="#4FC3F7" />
      <rect x="50" y="18" width="4" height="28" rx="2" fill="#4FC3F7" />
      <rect x="18" y="28" width="28" height="14" rx="7" fill="#3D2C5F" />
      <rect x="24" y="32" width="6" height="10" rx="3" fill="#4FC3F7" />
      <rect x="34" y="32" width="6" height="10" rx="3" fill="#4FC3F7" />
      <rect x="26" y="48" width="12" height="4" rx="2" fill="#3D2C5F" />

      <defs>
        <linearGradient id={gradId} x1="32" y1="20" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E1BEE7" />
          <stop offset="1" stopColor="#CE93D8" />
        </linearGradient>
      </defs>
    </svg>
  );
}
