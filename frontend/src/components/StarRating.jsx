import { Star } from "lucide-react";

function StarRating({ value = 0, onChange, size = 16 }) {
  const interactive = typeof onChange === "function";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        return (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange(star)}
            className={interactive ? "transition hover:scale-110" : "cursor-default"}
          >
            <Star
              size={size}
              className={active ? "fill-amber-400 text-amber-400" : "text-slate-300"}
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
