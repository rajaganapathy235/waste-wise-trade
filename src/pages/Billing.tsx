import { ArrowLeft } from "lucide-react";
import { useSafeBack } from "@/hooks/use-safe-back";

export default function Billing() {
  const goBack = useSafeBack("/");

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
        <button onClick={goBack}><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-base font-bold">Billing</h1>
      </header>
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-muted-foreground text-center">Billing system is being rebuilt. Share your screenshots and we'll build it step by step!</p>
      </div>
    </div>
  );
}