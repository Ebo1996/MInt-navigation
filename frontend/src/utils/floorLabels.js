/**
 * Consistent floor copy site-wide.
 * @param {number} floor
 * @returns {string}
 */
export function getFloorLabel(floor) {
  const f = Number(floor);
  if (f === 0) return "Ground floor";
  return `Floor ${f}`;
}

/**
 * Tailwind classes for floor pill (background + text + border).
 * @param {number} floor
 * @param {number} [seed=0]
 */
export function getFloorBadgeClasses(floor, seed = 0) {
  const f = Number(floor);
  const palette = [
    "bg-emerald-500/15 text-emerald-800 border-emerald-300/50",
    "bg-sky-500/15 text-sky-900 border-sky-300/50",
    "bg-violet-500/15 text-violet-900 border-violet-300/50",
    "bg-amber-500/15 text-amber-900 border-amber-300/50",
    "bg-rose-500/15 text-rose-900 border-rose-300/50",
    "bg-cyan-500/15 text-cyan-900 border-cyan-300/50",
  ];
  const idx = (f + seed) % palette.length;
  return palette[idx];
}
