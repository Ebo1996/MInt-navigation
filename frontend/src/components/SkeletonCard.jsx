function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
      <div className="mb-3 h-4 w-1/3 rounded bg-slate-200" />
      <div className="mb-2 h-3 w-2/3 rounded bg-slate-200" />
      <div className="h-3 w-1/2 rounded bg-slate-200" />
    </div>
  );
}

export default SkeletonCard;
