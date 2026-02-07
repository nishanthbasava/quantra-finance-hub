import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SubCategory {
  name: string;
  amount: number;
}

interface Category {
  name: string;
  amount: number;
  color: string;
  subcategories: SubCategory[];
}

const categories: Category[] = [
  {
    name: "Shopping",
    amount: 912,
    color: "hsl(260, 50%, 65%)",
    subcategories: [
      { name: "Clothing", amount: 420 },
      { name: "Electronics", amount: 312 },
      { name: "Home", amount: 180 },
    ],
  },
  {
    name: "Food",
    amount: 647,
    color: "hsl(170, 65%, 48%)",
    subcategories: [
      { name: "Groceries", amount: 380 },
      { name: "Dining Out", amount: 187 },
      { name: "Coffee", amount: 80 },
    ],
  },
  {
    name: "Travel",
    amount: 512,
    color: "hsl(200, 70%, 55%)",
    subcategories: [
      { name: "Flights", amount: 290 },
      { name: "Hotels", amount: 142 },
      { name: "Transport", amount: 80 },
    ],
  },
  {
    name: "Bills & Utilities",
    amount: 424,
    color: "hsl(215, 45%, 55%)",
    subcategories: [
      { name: "Electricity", amount: 145 },
      { name: "Internet", amount: 89 },
      { name: "Water", amount: 65 },
      { name: "Phone", amount: 125 },
    ],
  },
  {
    name: "Subscriptions",
    amount: 188,
    color: "hsl(185, 55%, 50%)",
    subcategories: [
      { name: "Streaming", amount: 45 },
      { name: "Software", amount: 89 },
      { name: "Gym", amount: 54 },
    ],
  },
  {
    name: "Other",
    amount: 66,
    color: "hsl(210, 20%, 70%)",
    subcategories: [
      { name: "Miscellaneous", amount: 66 },
    ],
  },
];

const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);

const SankeyDiagram = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  // Build flow items: either collapsed category or expanded subcategories
  const flowItems = useMemo(() => {
    const items: { key: string; label: string; amount: number; color: string; parentName: string; isSub: boolean }[] = [];
    categories.forEach((cat) => {
      if (expandedCategories.has(cat.name)) {
        cat.subcategories.forEach((sub) => {
          items.push({
            key: `${cat.name}-${sub.name}`,
            label: sub.name,
            amount: sub.amount,
            color: cat.color,
            parentName: cat.name,
            isSub: true,
          });
        });
      } else {
        items.push({
          key: cat.name,
          label: cat.name,
          amount: cat.amount,
          color: cat.color,
          parentName: cat.name,
          isSub: false,
        });
      }
    });
    return items;
  }, [expandedCategories]);

  const svgWidth = 700;
  const svgHeight = Math.max(400, flowItems.length * 52 + 40);
  const leftX = 200;
  const rightX = svgWidth - 80;
  const flowGap = 4;

  // Calculate positions
  const totalAmount = flowItems.reduce((s, i) => s + i.amount, 0);
  const availableHeight = svgHeight - 40;
  const barPositions = useMemo(() => {
    let yOffset = 20;
    return flowItems.map((item) => {
      const h = Math.max(12, (item.amount / totalAmount) * availableHeight - flowGap);
      const pos = { y: yOffset, height: h };
      yOffset += h + flowGap;
      return pos;
    });
  }, [flowItems, totalAmount, availableHeight]);

  // Right side: single bar
  const rightBarY = 20;
  const rightBarHeight = availableHeight - flowGap;

  const createFlowPath = (leftY: number, leftH: number, rightY: number, rightH: number) => {
    const x1 = leftX + 10;
    const x2 = rightX - 10;
    const cpx = (x1 + x2) / 2;

    return `
      M ${x1} ${leftY}
      C ${cpx} ${leftY}, ${cpx} ${rightY}, ${x2} ${rightY}
      L ${x2} ${rightY + rightH}
      C ${cpx} ${rightY + rightH}, ${cpx} ${leftY + leftH}, ${x1} ${leftY + leftH}
      Z
    `;
  };

  // Calculate right-side offsets for flows
  const rightFlowPositions = useMemo(() => {
    let rOffset = rightBarY;
    return flowItems.map((item) => {
      const h = (item.amount / totalAmount) * rightBarHeight;
      const pos = { y: rOffset, height: h };
      rOffset += h;
      return pos;
    });
  }, [flowItems, totalAmount, rightBarHeight]);

  return (
    <div className="quantra-card p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">▸ April</span>
          <span className="text-sm text-muted-foreground">All Accounts</span>
        </div>
        <div className="quantra-chip text-xs">April 2024 ▾</div>
      </div>

      {/* Sankey */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full"
          style={{ minHeight: "350px" }}
        >
          <defs>
            {flowItems.map((item, i) => (
              <linearGradient
                key={`grad-${item.key}`}
                id={`flow-grad-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={item.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={item.color} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>

          {/* Flow paths */}
          <AnimatePresence mode="wait">
            {flowItems.map((item, i) => (
              <motion.path
                key={item.key}
                d={createFlowPath(
                  barPositions[i].y,
                  barPositions[i].height,
                  rightFlowPositions[i].y,
                  rightFlowPositions[i].height
                )}
                fill={`url(#flow-grad-${i})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            ))}
          </AnimatePresence>

          {/* Left bars */}
          {flowItems.map((item, i) => (
            <g key={`left-${item.key}`}>
              <motion.rect
                x={leftX - 4}
                y={barPositions[i].y}
                width={4}
                height={barPositions[i].height}
                rx={2}
                fill={item.color}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                style={{ originY: "0" }}
              />
            </g>
          ))}

          {/* Left labels */}
          {flowItems.map((item, i) => (
            <g
              key={`label-${item.key}`}
              className="cursor-pointer"
              onClick={() => toggleCategory(item.parentName)}
            >
              <text
                x={leftX - 16}
                y={barPositions[i].y + barPositions[i].height / 2 - 4}
                textAnchor="end"
                className="text-[13px] font-medium fill-foreground"
              >
                {item.isSub ? `  ${item.label}` : item.label}
              </text>
              <text
                x={leftX - 16}
                y={barPositions[i].y + barPositions[i].height / 2 + 12}
                textAnchor="end"
                className="text-[11px] fill-muted-foreground"
              >
                ${item.amount.toLocaleString()}
              </text>
              {/* Invisible hover rect */}
              <rect
                x={0}
                y={barPositions[i].y - 2}
                width={leftX}
                height={barPositions[i].height + 4}
                fill="transparent"
              />
            </g>
          ))}

          {/* Right total bar */}
          <rect
            x={rightX - 6}
            y={rightBarY}
            width={6}
            rx={3}
            height={rightBarHeight}
            className="fill-muted-foreground/20"
          />

          {/* Right label */}
          <text
            x={rightX + 12}
            y={rightBarY + rightBarHeight / 2 - 10}
            className="text-[22px] font-bold fill-foreground"
          >
            ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </text>
          <text
            x={rightX + 12}
            y={rightBarY + rightBarHeight / 2 + 12}
            className="text-[12px] fill-muted-foreground"
          >
            April  $52,260
          </text>
        </svg>
      </div>

      {/* Click hint */}
      <p className="text-xs text-muted-foreground text-center mt-3">
        Click a category to expand subcategories
      </p>
    </div>
  );
};

export default SankeyDiagram;
