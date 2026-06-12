// EmptyStateVisuals.jsx
// Custom SVG illustrations for empty states in the application.

import React from 'react';

export const EmptyEventsIllustration = ({ width = 120, height = 120, color = "var(--accent)" }) => (
  <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="30" width="80" height="70" rx="8" stroke={color} strokeWidth="3" fill="#FFFBEB" />
    <path d="M40 20v20M80 20v20" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="20" y1="55" x2="100" y2="55" stroke={color} strokeWidth="3" />
    <circle cx="45" cy="75" r="5" fill={color} opacity="0.4" />
    <line x1="58" y1="75" x2="85" y2="75" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <circle cx="45" cy="90" r="5" fill={color} opacity="0.4" />
    <line x1="58" y1="90" x2="80" y2="90" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    {/* Star / Sparkle */}
    <path d="M100 25l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8z" fill={color} />
  </svg>
);

export const EmptyDeletedIllustration = ({ width = 120, height = 120, color = "var(--accent)" }) => (
  <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 35H80L75 95H45L40 35Z" stroke={color} strokeWidth="3" fill="#FFFBEB" strokeLinejoin="round" />
    <path d="M30 35H90" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M50 35V25C50 22.2386 52.2386 20 55 20H65C67.7614 20 70 22.2386 70 25V35" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="50" y1="45" x2="52" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <line x1="60" y1="45" x2="60" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    <line x1="70" y1="45" x2="68" y2="80" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
    {/* Clean sparkles to indicate nothing is here */}
    <path d="M20 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill={color} opacity="0.6"/>
    <path d="M95 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill={color} opacity="0.4"/>
  </svg>
);

export const EmptySearchIllustration = ({ width = 120, height = 120, color = "var(--accent)" }) => (
  <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="25" stroke={color} strokeWidth="4" fill="#FFFBEB" />
    <line x1="67" y1="67" x2="90" y2="90" stroke={color} strokeWidth="6" strokeLinecap="round" />
    {/* culinary element inside magnifying glass */}
    <path d="M40 50c0-8 20-8 20 0s-20 8-20 0z" stroke={color} strokeWidth="2" opacity="0.5" />
    <path d="M45 42c-2-3-5-3-5 1M55 42c-2-3-5-3-5 1" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    {/* Question marks / floating elements */}
    <path d="M85 30c0-5-5-5-5-2s3 4 1 5m-1 3v2" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    <path d="M30 85c0-4-4-4-4-2s2 3 1 4m-1 2v1" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

export const EmptyAuditIllustration = ({ width = 120, height = 120, color = "var(--accent)" }) => (
  <svg width={width} height={height} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="20" width="60" height="80" rx="6" stroke={color} strokeWidth="3" fill="#FFFBEB" />
    {/* Clip */}
    <rect x="45" y="15" width="30" height="12" rx="3" stroke={color} strokeWidth="3" fill="#fff" />
    <line x1="40" y1="45" x2="80" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="60" x2="70" y2="60" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <line x1="40" y1="75" x2="80" y2="75" stroke={color} strokeWidth="3" strokeLinecap="round" />
    {/* Eye or magnifying glass overlapping */}
    <circle cx="75" cy="85" r="18" fill="#fff" stroke={color} strokeWidth="3" />
    <circle cx="75" cy="85" r="6" fill={color} />
    <path d="M60 85c4-6 11-8 15-8M90 85c-4-6-11-8-15-8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const EmptyStateWrapper = ({ title, description, illustration: Illustration, color }) => (
  <div className="empty-state-visual">
    <Illustration color={color} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);
