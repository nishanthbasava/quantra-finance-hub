import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { getCategoryByName, getSubCategoryByName } from "./sankey/sankeyData";
import { useMultiLevelLayout, LABEL_AREA, NODE_WIDTH } from "./sankey/useMultiLevelLayout";
import MultiLevelFlowPath from "./sankey/MultiLevelFlowPath";
import MultiLevelNode from "./sankey/MultiLevelNode";
import MultiLevelTooltip from "./sankey/MultiLevelTooltip";
import { useSelection } from "@/contexts/SelectionContext";
import { useData, TIME_RANGE_OPTIONS, type TimeRange } from "@/contexts/DataContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SankeyDiagram = () => {
  const { selectMode, selectedNodes, toggleNode } = useSelection();
  const { sankeyCategories, totalExpenses, timeRange, setTimeRange, isUpdating } = useData();

  const [expandedL1, setExpandedL1] = useState<Set<string>>(new Set());
  const [expandedL2, setExpandedL2] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedCategory, setFocusedCategory] = useState<string | null>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
    amount: number;
    color: string;
    parentAmount: number | null;
    depth: number;
  }>({ visible: false, x: 0, y: 0, label: "", amount: 0, color: "", parentAmount: null, depth: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { columns, links, nodePositions, svgHeight, svgWidth, maxDepth } = useMultiLevelLayout(
    sankeyCategories, totalExpenses, expandedL1, expandedL2
  );

  const currentLabel = TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label ?? "Last 90 Days";

  const handleRangeChange = useCallback((range: TimeRange) => {
    // Reset expansions when range changes
    setExpandedL1(new Set());
    setExpandedL2(new Set());
    setFocusedCategory(null);
    setTimeRange(range);
  }, [setTimeRange]);

  const toggleLevel1 = useCallback((name: string) => {
    setExpandedL1((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        setExpandedL2((prev2) => {
          const next2 = new Set(prev2);
          for (const key of prev2) {
            if (key.startsWith(name + ">")) next2.delete(key);
          }
          return next2;
        });
      } else {
        next.add(name);
      }
      return next;
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
    }, 100);
  }, []);

  const toggleLevel2 = useCallback((subId: string) => {
    setExpandedL2((prev) => {
      const next = new Set(prev);
      if (next.has(subId)) {
        next.delete(subId);
      } else {
        next.add(subId);
      }
      return next;
    });
    setTimeout(() => {
      scrollRef.current?.scrollTo({ left: scrollRef.current.scrollWidth, behavior: "smooth" });
    }, 100);
  }, []);

  const handleNodeClick = useCallback((node: { id: string; depth: number; categoryName: string }) => {
    if (node.depth === 0) {
      toggleLevel1(node.id);
      setFocusedCategory((prev) => (prev === node.categoryName ? null : node.categoryName));
    } else if (node.depth === 1) {
      toggleLevel2(node.id);
    }
  }, [toggleLevel1, toggleLevel2]);

  const handleBackgroundClick = useCallback(() => {
    setFocusedCategory(null);
    setExpandedL1(new Set());
    setExpandedL2(new Set());
  }, []);

  const getNodeAncestry = useCallback((nodeId: string): Set<string> => {
    const ancestry = new Set<string>();
    ancestry.add(nodeId);
    const parts = nodeId.split(">");
    for (let i = 1; i < parts.length; i++) {
      ancestry.add(parts.slice(0, i).join(">"));
    }
    columns.forEach((col) => {
      col.nodes.forEach((n) => {
        if (n.id.startsWith(nodeId + ">")) {
          ancestry.add(n.id);
        }
      });
    });
    return ancestry;
  }, [columns]);

  const handleNodeHover = useCallback((node: { id: string; label: string; amount: number; color: string; depth: number; categoryName: string; parentId: string | null }) => {
    setHoveredId(node.id);
    const pos = nodePositions.get(node.id);
    if (pos && containerRef.current) {
      const svgEl = containerRef.current.querySelector("svg");
      const scrollEl = scrollRef.current;
      if (svgEl && scrollEl) {
        const svgRect = svgEl.getBoundingClientRect();
        const scaleX = svgRect.width / svgWidth;
        const scaleY = svgRect.height / svgHeight;
        const tooltipX = (pos.x + NODE_WIDTH + 20) * scaleX - scrollEl.scrollLeft;
        const tooltipY = pos.y * scaleY - 10;

        let parentAmount: number | null = null;
        if (node.depth === 1) {
          const cat = getCategoryByName(sankeyCategories, node.categoryName);
          parentAmount = cat?.amount ?? null;
        } else if (node.depth === 2 && node.parentId) {
          const parts = node.parentId.split(">");
          if (parts.length === 2) {
            const sub = getSubCategoryByName(sankeyCategories, parts[0], parts[1]);
            parentAmount = sub?.amount ?? null;
          }
        }

        setTooltip({
          visible: true,
          x: tooltipX,
          y: tooltipY,
          label: node.label,
          amount: node.amount,
          color: node.color,
          parentAmount,
          depth: node.depth,
        });
      }
    }
  }, [nodePositions, svgWidth, svgHeight, sankeyCategories]);

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  const hoveredAncestry = hoveredId ? getNodeAncestry(hoveredId) : null;

  const getNodeState = (nodeId: string, categoryName: string) => {
    const hasHover = hoveredId !== null;
    const hasFocus = focusedCategory !== null;
    const isHovered = hoveredId === nodeId;
    const isInHoverPath = hoveredAncestry?.has(nodeId) ?? false;
    const isFocusMatch = focusedCategory === categoryName;
    const isHighlighted = isHovered || isInHoverPath || (hasFocus && isFocusMatch && !hasHover);
    const isFaded = (hasHover && !isInHoverPath) || (hasFocus && !isFocusMatch && !hasHover);
    return { isHighlighted, isFaded, isHovered };
  };

  const getLinkState = (sourceId: string, targetId: string, categoryName: string) => {
    const hasHover = hoveredId !== null;
    const hasFocus = focusedCategory !== null;
    const isInHoverPath = hoveredAncestry?.has(sourceId) && hoveredAncestry?.has(targetId);
    const isFocusMatch = focusedCategory === categoryName;
    const isHighlighted = (isInHoverPath ?? false) || (hasFocus && isFocusMatch && !hasHover);
    const isFaded = (hasHover && !isInHoverPath) || (hasFocus && !isFocusMatch && !hasHover);
    return { isHighlighted, isFaded };
  };

  const sourceNodeTotals = new Map<string, number>();
  links.forEach((link) => {
    sourceNodeTotals.set(link.sourceId, (sourceNodeTotals.get(link.sourceId) ?? 0) + link.amount);
  });

  const sourceFlowOffsets = new Map<string, number>();

  const hasExpansion = expandedL1.size > 0 || expandedL2.size > 0;
  const hintText = focusedCategory
    ? `Exploring ${focusedCategory} · Click background to reset`
    : hasExpansion
      ? "Click nodes to drill deeper · Click background to reset"
      : "Click a category to explore subcategories";

  const needsScroll = columns.length > 1;

  return (
    <div className="quantra-card p-6 overflow-hidden relative" ref={containerRef}>
      {/* Shimmer overlay */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-20 rounded-xl bg-card/60 backdrop-blur-[1px]"
          >
            <div className="h-full w-full flex items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                Updating…
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">▸ Cash Flow Explorer</span>
          <span className="text-sm text-muted-foreground">All Accounts</span>
        </div>

        {/* Time range dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="quantra-chip text-xs inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-offset-1 focus:ring-offset-background">
              {currentLabel}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {TIME_RANGE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleRangeChange(option.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className={timeRange === option.value ? "font-medium text-foreground" : ""}>
                  {option.label}
                </span>
                {timeRange === option.value && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Scrollable Sankey container */}
      <div className="relative">
        {needsScroll && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        )}
        {needsScroll && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto overflow-y-hidden scrollbar-thin"
          style={{ scrollBehavior: "smooth" }}
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="block"
            style={{ minHeight: "350px" }}
            onClick={handleBackgroundClick}
          >
            <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="transparent" />

            <AnimatePresence mode="popLayout">
              {links.map((link) => {
                const sourcePos = nodePositions.get(link.sourceId);
                const targetPos = nodePositions.get(link.targetId);
                if (!sourcePos || !targetPos) return null;

                const state = getLinkState(link.sourceId, link.targetId, link.categoryName);
                const sourceTotal = sourceNodeTotals.get(link.sourceId) ?? link.amount;

                const currentOffset = sourceFlowOffsets.get(link.sourceId) ?? 0;
                const flowH = (link.amount / sourceTotal) * sourcePos.height;
                sourceFlowOffsets.set(link.sourceId, currentOffset + flowH);

                const adjustedSourcePos = {
                  ...sourcePos,
                  y: sourcePos.y + currentOffset,
                  height: flowH,
                };

                return (
                  <MultiLevelFlowPath
                    key={`flow-${link.sourceId}-${link.targetId}`}
                    sourcePos={adjustedSourcePos}
                    targetPos={targetPos}
                    color={link.color}
                    amount={link.amount}
                    sourceTotal={sourceTotal}
                    targetTotal={targetPos.height}
                    isHighlighted={state.isHighlighted}
                    isFaded={state.isFaded}
                    onMouseEnter={() => setHoveredId(link.targetId)}
                    onMouseLeave={handleNodeLeave}
                  />
                );
              })}
            </AnimatePresence>

            {columns.map((col) =>
              col.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const state = getNodeState(node.id, node.categoryName);
                const hasChildren =
                  node.depth === 0
                    ? (getCategoryByName(sankeyCategories, node.id)?.children.length ?? 0) > 0
                    : node.depth === 1
                      ? (() => {
                          const parts = node.id.split(">");
                          return (getSubCategoryByName(sankeyCategories, parts[0], parts[1])?.children.length ?? 0) > 0;
                        })()
                      : false;

                const isExpanded =
                  node.depth === 0 ? expandedL1.has(node.id) :
                  node.depth === 1 ? expandedL2.has(node.id) : false;

                return (
                  <MultiLevelNode
                    key={`node-${node.id}`}
                    node={node}
                    position={pos}
                    isHighlighted={state.isHighlighted}
                    isFaded={state.isFaded}
                    isHovered={state.isHovered}
                    isExpanded={isExpanded}
                    isSelected={selectedNodes.has(node.id)}
                    hasChildren={hasChildren}
                    maxDepth={maxDepth}
                    selectMode={selectMode}
                    onClick={() => handleNodeClick(node)}
                    onSelectClick={() =>
                      toggleNode({
                        id: node.id,
                        label: node.label,
                        depth: node.depth,
                        categoryName: node.categoryName,
                        amount: node.amount,
                      })
                    }
                    onMouseEnter={() => handleNodeHover(node)}
                    onMouseLeave={handleNodeLeave}
                  />
                );
              })
            )}

            <motion.g
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <text
                x={LABEL_AREA + NODE_WIDTH + 20}
                y={svgHeight - 10}
                className="text-[11px] fill-muted-foreground select-none"
              >
                Total: ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </text>
            </motion.g>
          </svg>
        </div>
      </div>

      {tooltip.visible && (
        <MultiLevelTooltip
          visible={tooltip.visible}
          x={tooltip.x}
          y={tooltip.y}
          label={tooltip.label}
          amount={tooltip.amount}
          color={tooltip.color}
          parentAmount={tooltip.parentAmount}
          depth={tooltip.depth}
        />
      )}

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
