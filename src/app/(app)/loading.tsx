import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex min-h-64 items-center justify-center"
    >
      <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
    </div>
  );
}
