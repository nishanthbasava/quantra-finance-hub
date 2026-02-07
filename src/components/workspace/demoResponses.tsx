import type { SelectedSankeyNode, SelectedTransaction } from "@/contexts/SelectionContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: {
    type: "pie" | "bar" | "line";
    title: string;
    data: { name: string; value: number; fill?: string }[];
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

const COLORS = [
  "hsl(170, 70%, 50%)",
  "hsl(210, 80%, 55%)",
  "hsl(260, 50%, 60%)",
  "hsl(30, 80%, 55%)",
  "hsl(340, 60%, 60%)",
  "hsl(155, 65%, 42%)",
];

let idCounter = 100;

function nextId() {
  return `msg-${++idCounter}`;
}

export function generateDemoResponse(
  userText: string,
  nodes: Map<string, SelectedSankeyNode>,
  transactions: Map<string, SelectedTransaction>
): ChatMessage {
  const lower = userText.toLowerCase();
  const nodeArr = Array.from(nodes.values());
  const txArr = Array.from(transactions.values());
  const totalAmount = [
    ...nodeArr.map((n) => n.amount),
    ...txArr.map((t) => t.amount),
  ].reduce((s, a) => s + a, 0);

  // Pattern matching
  if (lower.includes("pattern") || lower.includes("see")) {
    const topItems = [...txArr]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const categories = new Map<string, number>();
    txArr.forEach((t) => categories.set(t.category, (categories.get(t.category) ?? 0) + t.amount));
    nodeArr.forEach((n) => categories.set(n.categoryName, (categories.get(n.categoryName) ?? 0) + n.amount));

    const chartData = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, fill: COLORS[i % COLORS.length] }));

    return {
      id: nextId(),
      role: "assistant",
      content: `Looking at your ${nodes.size + transactions.size} selected items totaling **$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}**, here are the key patterns:\n\n- **${chartData[0]?.name ?? "Top category"}** dominates your selection at $${chartData[0]?.value?.toLocaleString() ?? "0"}\n- ${topItems.length > 0 ? `Your highest single transaction is **${topItems[0].merchant}** at $${topItems[0].amount.toFixed(2)}` : "No individual transactions selected"}\n- ${chartData.length > 1 ? `There's a clear concentration in ${chartData.slice(0, 2).map((c) => c.name).join(" and ")}` : "Data is concentrated in one area"}`,
      chart: chartData.length > 0 ? { type: "pie", title: "Spending by Category", data: chartData } : undefined,
    };
  }

  if (lower.includes("category") || lower.includes("breakdown") || lower.includes("break")) {
    const categories = new Map<string, number>();
    txArr.forEach((t) => categories.set(t.category, (categories.get(t.category) ?? 0) + t.amount));
    nodeArr.forEach((n) => {
      const cat = n.id.split(">")[0];
      categories.set(cat, (categories.get(cat) ?? 0) + n.amount);
    });

    const chartData = Array.from(categories.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, fill: COLORS[i % COLORS.length] }));

    return {
      id: nextId(),
      role: "assistant",
      content: `Here's the category breakdown for your selected items:\n\n${chartData.map((c) => `- **${c.name}**: $${c.value.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${((c.value / totalAmount) * 100).toFixed(1)}%)`).join("\n")}`,
      chart: { type: "bar", title: "Category Breakdown", data: chartData },
    };
  }

  if (lower.includes("compare") || lower.includes("transaction")) {
    const rows = txArr.slice(0, 8).map((t) => [
      t.merchant,
      t.category,
      `$${t.amount.toFixed(2)}`,
    ]);

    return {
      id: nextId(),
      role: "assistant",
      content: `Here's a comparison of your ${txArr.length} selected transaction${txArr.length !== 1 ? "s" : ""}. ${txArr.length > 0 ? `The average amount is **$${(txArr.reduce((s, t) => s + t.amount, 0) / txArr.length).toFixed(2)}**.` : "No transactions selected for comparison."}`,
      table: rows.length > 0 ? { headers: ["Merchant", "Category", "Amount"], rows } : undefined,
    };
  }

  if (lower.includes("chart") || lower.includes("visual") || lower.includes("graph")) {
    const merchants = new Map<string, number>();
    txArr.forEach((t) => merchants.set(t.merchant, (merchants.get(t.merchant) ?? 0) + t.amount));

    const chartData = Array.from(merchants.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value], i) => ({ name, value: Math.round(value * 100) / 100, fill: COLORS[i % COLORS.length] }));

    return {
      id: nextId(),
      role: "assistant",
      content: `Here's a visual breakdown of your selected merchants:`,
      chart: chartData.length > 0 ? { type: "bar", title: "Top Merchants", data: chartData } : undefined,
    };
  }

  // Default
  return {
    id: nextId(),
    role: "assistant",
    content: `I'm analyzing your **${nodes.size + transactions.size} selected items** (totaling **$${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}**). Here's what I can tell you:\n\n- You have **${nodes.size}** Sankey nodes and **${transactions.size}** transactions selected\n- Try asking me to "break this down by category", "compare these transactions", or "what patterns do you see?"\n- I can also "generate a chart" from your current selection`,
  };
}
