import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "bot";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] px-4 py-2 rounded-lg text-sm",
        role === "user"
          ? "ml-auto bg-primary text-primary-foreground"
          : "mr-auto bg-muted text-muted-foreground"
      )}
    >
      {content}
    </div>
  );
}
