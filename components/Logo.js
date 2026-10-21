export default function Logo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-label="Points Arena">
      <defs><linearGradient id="lgBg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--pri)" /><stop offset="1" stopColor="var(--pri2)" /></linearGradient>
        <linearGradient id="lgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe27a" /><stop offset="1" stopColor="#ff9f2e" /></linearGradient></defs>
      <rect width="64" height="64" rx="16" fill="url(#lgBg)" />
      <path d="M20 14h24v10a12 12 0 0 1-24 0V14z" fill="url(#lgGold)" />
      <path d="M20 18h-6v4a8 8 0 0 0 8 8M44 18h6v4a8 8 0 0 1-8 8" fill="none" stroke="url(#lgGold)" strokeWidth="3" strokeLinecap="round" />
      <rect x="29" y="36" width="6" height="8" fill="url(#lgGold)" />
      <rect x="22" y="44" width="20" height="5" rx="2.5" fill="url(#lgGold)" />
    </svg>
  );
}
