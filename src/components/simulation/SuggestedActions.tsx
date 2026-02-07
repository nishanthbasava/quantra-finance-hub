import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  suggestions: string[];
}

const SuggestedActions = ({ suggestions }: Props) => (
  <Card className="quantra-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-quantra-orange" />
        Suggested actions
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {suggestions.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-start gap-2.5 py-1.5 px-3 rounded-lg bg-secondary/50 text-sm text-foreground"
        >
          <span className="text-quantra-teal font-bold mt-0.5 shrink-0">→</span>
          <span>{s}</span>
        </motion.div>
      ))}
    </CardContent>
  </Card>
);

export default SuggestedActions;
