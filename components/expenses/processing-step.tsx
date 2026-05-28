import { Sparkles, Loader2 } from "lucide-react";

export function ProcessingStep({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-9 w-9 text-primary" />
        </div>
        <div className="absolute -right-1 -top-1">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold">Analyzing statement…</p>
        <p className="mt-1 text-sm text-muted-foreground">{fileName}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Gemini is detecting and categorizing your transactions
        </p>
      </div>
    </div>
  );
}
