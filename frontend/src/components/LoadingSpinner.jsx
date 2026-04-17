import { Loader2 } from "lucide-react";

function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8 text-mint-800">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
