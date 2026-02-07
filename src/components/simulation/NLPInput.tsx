import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onSubmit: (text: string) => boolean;
}

const NLPInput = ({ onSubmit }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    const success = onSubmit(text.trim());
    if (success) {
      toast.success("Scenario added from description");
      setText("");
    } else {
      toast.error("Could not parse scenario. Try: \"Cut dining out by $25/week and cancel Spotify.\"");
    }
  };

  return (
    <div className="quantra-card rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-quantra-purple" />
        <span className="text-xs text-muted-foreground font-medium">Describe a scenario in plain English</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          placeholder='Example: Cut dining out by $25/week and cancel Spotify.'
          className="h-9 text-sm flex-1"
        />
        <Button onClick={handleSubmit} size="sm" variant="secondary" className="gap-1.5 shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
          Parse
        </Button>
      </div>
    </div>
  );
};

export default NLPInput;
