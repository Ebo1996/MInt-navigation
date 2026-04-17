function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() === "responded" ? "responded" : "pending";
  const classes =
    normalized === "responded"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {normalized}
    </span>
  );
}

export default StatusBadge;
