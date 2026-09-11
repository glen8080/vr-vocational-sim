/** Minimal line-icon set. Deliberately dependency-free and monochrome. */

const P = {
  hands: 'M9 11V5.5a1.5 1.5 0 013 0V11m0-1V4.5a1.5 1.5 0 013 0V11m0-.5V6.5a1.5 1.5 0 013 0V13c0 3.5-2 6.5-5.5 6.5S7 16.5 7 13v-2.5a1.5 1.5 0 013 0',
  glasses: 'M2 12a3 3 0 016 0 3 3 0 016 0 3 3 0 016 0M2 12l-1.5-3M20 12l1.5-3M8 12c-.6 1.6-.4 3 1 3.6M14 12c.6 1.6.4 3-1 3.6',
  gloves: 'M7 12V5.5a1.5 1.5 0 013 0V11m0-1V4a1.5 1.5 0 013 0v7m0-1V6.5a1.5 1.5 0 013 0V15c0 3-2 5.5-5 5.5S7 17.5 7 15v-3',
  tester: 'M14.5 3.5l6 6M12 6l6 6M4 20l1.5-4.5L13 8l-1-1-7.5 7.5L4 20zM9 12l1.5 1.5M3 21h3',
  screwdriver: 'M14.5 3.5l6 6-2 2-6-6 2-2zM12 6L6 12l-.8-.8a2 2 0 00-2.8 2.8l3.5 3.5 6-6M3 21l2-2',
  stripper: 'M6 3l4 5M18 3l-4 5M9 8l2 6-3 7M15 8l-2 6 3 7M12 3v3',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 018 0v4M12 15v3',
  wrench: 'M15 3a5 5 0 00-4.3 7.5L4 17.2 6.8 20l6.7-6.7A5 5 0 1015 3z',
  bucket: 'M4 7h16l-2 13H6L4 7zM8 7V4a4 4 0 018 0v3M2 7h20',
  valve: 'M12 21V9M8 9h8v4H8zM12 6a3 3 0 100-3 3 3 0 000 3zM9 6H6M15 6h3',
  faucet: 'M4 6h8M12 6v3a5 5 0 01-5 5H6a5 5 0 01-5-5V6M6.5 14v5M4 19h5',
  pipe: 'M7 3v10a5 5 0 005 5 5 5 0 005-5V8M7 3h4M16 3h-4M14 3v5',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7l1-8z',
  drop: 'M12 3s6 7 6 11a6 6 0 01-12 0c0-4 6-11 6-11z',
  camera: 'M3 8h4l1.5-2h7L17 8h4v11H3zM12 16a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  refresh: 'M20 12a8 8 0 11-2.3-5.7M20 4v5h-5',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.7 1 1.5 1 2.5h6c0-1 .4-1.8 1-2.5A6 6 0 0012 3z',
  question: 'M9.2 9a3 3 0 015.8 1c0 2-3 2.5-3 4.5M12 18h.01',
  eye: 'M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6zM12 15a3 3 0 100-6 3 3 0 000 6z',
  target: 'M12 3v3M12 18v3M3 12h3M18 12h3M12 16a4 4 0 100-8 4 4 0 000 8z',
  check: 'M4 12.5l5 5L20 6.5',
  plus: 'M12 5v14M5 12h14',
  wrenchGear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2v.2a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.6 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00-1.2-2.9H3a2 2 0 110-4h.1A1.7 1.7 0 004.7 8a1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V2a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V8a1.7 1.7 0 001.5 1H18a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z',
}

export default function Icon({ name, size = 24, strokeWidth = 1.7, className = '' }) {
  const d = P[name] || P.target
  return (
    <svg
      className={className}
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
