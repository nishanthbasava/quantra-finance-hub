import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface Props {
  question: string;
}

const QuantraAsks = ({ question }: Props) => (
  <Card className="quantra-card border-primary/20 bg-primary/[0.03]">
    <CardContent className="p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <MessageCircle className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1 font-medium">Quantra asks you</p>
        <p className="text-sm text-foreground leading-relaxed">{question}</p>
      </div>
    </CardContent>
  </Card>
);

export default QuantraAsks;
