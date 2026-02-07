import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { totalExpenses } from "./sankey/sankeyData";
import { useSankeyLayout, SVG_WIDTH, LEFT_X, RIGHT_X, RIGHT_BAR_Y, FLOW_GAP } from "./sankey/useSankeyLayout";
import SankeyFlowPath from "./sankey/SankeyFlowPath";
import SankeyNode from "./sankey/SankeyNode";
import SankeyTooltip from "./sankey/SankeyTooltip";

const SankeyDiagram = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    key: string;
  }>({ visible: false, x: 0, y: 0, key: "" });

  const containerRef = useRef<HTMLDivElement>(null);

  const { flowItems, barPositions, rightFlowPositions, svgHeight, totalAmount } = useSankeyLayout(expandedCategories);

  const availableHeight = svgHeight - 40;
  const rightBarHeight = availableHeight - FLOW_GAP;

  const toggleCategory = useCallback((name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback((parentName: string) => {
    toggleCategory(parentName);
    setFocusedCategory((prev) => (prev === parentName ? null : parentName));
  }, [toggleCategory]);

  const handleBackgroundClick = useCallback(() => {
    setFocusedCategory(null);
  }, []);

  const handleFlowHover = useCallback((key: string, index: number) => {
    setHoveredKey(key);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const svgRect = containerRef.current.querySelector("svg")?.getBoundingClientRect();
      if (svgRect) {
        const scaleX = svgRect.width / SVG_WIDTH;
        const scaleY = svgRect.height / svgHeight;
        const item = flowItems[index];
        const barPos = barPositions[index];
        const tooltipX = (LEFT_X + 30) * scaleX;
        const tooltipY = barPos.y * scaleY - 10;
        setTooltip({ visible: true, x: tooltipX, y: tooltipY, key });
      }
    }
  }, [flowItems, barPositions, svgHeight]);

  const handleFlowLeave = useCallback(() => {
    setHoveredKey(null);
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  // Determine highlight/fade state
  const getItemState = (item: typeof flowItems[0]) => {
    const hasHover = hoveredKey !== null;
    const hasFocus = focusedCategory !== null;

    const isHovered = hoveredKey === item.key;
    const isFocusMatch = focusedCategory === item.parentName;

    const isHighlighted = isHovered || (hasFocus && isFocusMatch && !hasHover);
    const isFaded =
      (hasHover && !isHovered) ||
      (hasFocus && !isFocusMatch && !hasHover);

    return { isHighlighted, isFaded, isHovered };
  };

  // Hint text
  const anyExpanded = expandedCategories.size > 0;
  const hintText = focusedCategory
    ? `Viewing ${focusedCategory} · Click background to reset`
    : anyExpanded
      ? "Click a category to collapse · Click background to reset"
      : "Click a category to expand subcategories";

  const hoveredItem = hoveredKey ? flowItems.find((f) => f.key === hoveredKey) : null;

  return (
    <div className="quantra-card p-6 overflow-hidden" ref={containerRef}>
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
          viewBox={`0 0 ${SVG_WIDTH} ${svgHeight}`}
          className="w-full"
          style={{ minHeight: "350px" }}
          onClick={handleBackgroundClick}
        >
          <defs>
            {flowItems.map((item, i) => {
              const state = getItemState(item);
              return (
                <linearGradient
                  key={`grad-${item.key}`}
                  id={`flow-grad-${i}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor={item.color}
                    stopOpacity={state.isHighlighted ? 0.85 : 0.55}
                  />
                  <stop
                    offset="100%"
                    stopColor={item.color}
                    stopOpacity={state.isHighlighted ? 0.45 : 0.15}
                  />
                </linearGradient>
              );
            })}
          </defs>

          {/* Background click catcher */}
          <rect
            x={0}
            y={0}
            width={SVG_WIDTH}
            height={svgHeight}
            fill="transparent"
          />

          {/* Flow paths */}
          <AnimatePresence mode="popLayout">
            {flowItems.map((item, i) => {
              const state = getItemState(item);
              return (
                <SankeyFlowPath
                  key={item.key}
                  leftY={barPositions[i].y}
                  leftH={barPositions[i].height}
                  rightY={rightFlowPositions[i].y}
                  rightH={rightFlowPositions[i].height}
                  gradientId={`flow-grad-${i}`}
                  isHighlighted={state.isHighlighted}
                  isFaded={state.isFaded}
                  onMouseEnter={() => handleFlowHover(item.key, i)}
                  onMouseLeave={handleFlowLeave}
                />
              );
            })}
          </AnimatePresence>

          {/* Left nodes */}
          {flowItems.map((item, i) => {
            const state = getItemState(item);
            return (
              <SankeyNode
                key={`node-${item.key}`}
                itemKey={item.key}
                label={item.label}
                amount={item.amount}
                color={item.color}
                isSub={item.isSub}
                parentName={item.parentName}
                index={i}
                position={barPositions[i]}
                isFocused={state.isHighlighted}
                isFaded={state.isFaded}
                isHovered={state.isHovered}
                onClick={() => handleNodeClick(item.parentName)}
                onMouseEnter={() => handleFlowHover(item.key, i)}
                onMouseLeave={handleFlowLeave}
              />
            );
          })}

          {/* Right total bar */}
          <motion.rect
            x={RIGHT_X - 6}
            y={RIGHT_BAR_Y}
            width={6}
            rx={3}
            height={rightBarHeight}
            className="fill-muted-foreground/20"
            animate={{ height: rightBarHeight }}
            transition={{ duration: 0.35 }}
          />

          {/* Right label */}
          <text
            x={RIGHT_X + 12}
            y={RIGHT_BAR_Y + rightBarHeight / 2 - 10}
            className="text-[22px] font-bold fill-foreground"
          >
            ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </text>
          <text
            x={RIGHT_X + 12}
            y={RIGHT_BAR_Y + rightBarHeight / 2 + 12}
            className="text-[12px] fill-muted-foreground"
          >
            April  $52,260
          </text>
        </svg>

        {/* Tooltip overlay */}
        {hoveredItem && (
          <SankeyTooltip
            visible={tooltip.visible}
            x={tooltip.x}
            y={tooltip.y}
            label={hoveredItem.label}
            amount={hoveredItem.amount}
            color={hoveredItem.color}
            isSub={hoveredItem.isSub}
            parentName={hoveredItem.parentName}
          />
        )}
      </div>

      {/* Contextual hint */}
      <motion.p
        key={hintText}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-xs text-muted-foreground text-center mt-3"
      >
        {hintText}
      </motion.p>
    </div>
  );
};

export default SankeyDiagram;
