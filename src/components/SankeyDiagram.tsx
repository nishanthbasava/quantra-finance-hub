import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, totalExpenses, getCategoryByName, getSubCategoryByName } from "./sankey/sankeyData";
import { useMultiLevelLayout, COLUMN_SPACING, LABEL_AREA, NODE_WIDTH } from "./sankey/useMultiLevelLayout";
import MultiLevelFlowPath from "./sankey/MultiLevelFlowPath";
import MultiLevelNode from "./sankey/MultiLevelNode";
import MultiLevelTooltip from "./sankey/MultiLevelTooltip";

const SankeyDiagram = () => {
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

  const { columns, links, nodePositions, svgHeight, svgWidth, maxDepth } = useMultiLevelLayout(expandedL1, expandedL2);

  const toggleLevel1 = useCallback((name: string) => {
    setExpandedL1((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
        // Also collapse any L2 children
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
    // Smooth scroll to reveal new column
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

  // Get the ancestry path of a node for highlighting
  const getNodeAncestry = useCallback((nodeId: string): Set<string> => {
    const ancestry = new Set<string>();
    ancestry.add(nodeId);
    const parts = nodeId.split(">");
    for (let i = 1; i < parts.length; i++) {
      ancestry.add(parts.slice(0, i).join(">"));
    }
    // Also include all descendants
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
        const scrollRect = scrollEl.getBoundingClientRect();
        const scaleX = svgRect.width / svgWidth;
        const scaleY = svgRect.height / svgHeight;
        const tooltipX = (pos.x + NODE_WIDTH + 20) * scaleX - scrollEl.scrollLeft;
        const tooltipY = pos.y * scaleY - 10;

        // Find parent amount
        let parentAmount: number | null = null;
        if (node.depth === 1) {
          const cat = getCategoryByName(node.categoryName);
          parentAmount = cat?.amount ?? null;
        } else if (node.depth === 2 && node.parentId) {
          const parts = node.parentId.split(">");
          if (parts.length === 2) {
            const sub = getSubCategoryByName(parts[0], parts[1]);
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
  }, [nodePositions, svgWidth, svgHeight]);

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null);
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  // Highlight logic
  const hoveredAncestry = hoveredId ? getNodeAncestry(hoveredId) : null;

  const getNodeState = (nodeId: string, categoryName: string) => {
    const hasHover = hoveredId !== null;
    const hasFocus = focusedCategory !== null;

    const isHovered = hoveredId === nodeId;
    const isInHoverPath = hoveredAncestry?.has(nodeId) ?? false;
    const isFocusMatch = focusedCategory === categoryName;

    const isHighlighted = isHovered || isInHoverPath || (hasFocus && isFocusMatch && !hasHover);
    const isFaded =
      (hasHover && !isInHoverPath) ||
      (hasFocus && !isFocusMatch && !hasHover);

    return { isHighlighted, isFaded, isHovered };
  };

  const getLinkState = (sourceId: string, targetId: string, categoryName: string) => {
    const hasHover = hoveredId !== null;
    const hasFocus = focusedCategory !== null;

    const isInHoverPath = hoveredAncestry?.has(sourceId) && hoveredAncestry?.has(targetId);
    const isFocusMatch = focusedCategory === categoryName;

    const isHighlighted = (isInHoverPath ?? false) || (hasFocus && isFocusMatch && !hasHover);
    const isFaded =
      (hasHover && !isInHoverPath) ||
      (hasFocus && !isFocusMatch && !hasHover);

    return { isHighlighted, isFaded };
  };

  // Compute source node totals for proportional flow sizing
  const sourceNodeTotals = new Map<string, number>();
  links.forEach((link) => {
    sourceNodeTotals.set(link.sourceId, (sourceNodeTotals.get(link.sourceId) ?? 0) + link.amount);
  });

  // Track cumulative offset per source for stacked flows
  const sourceFlowOffsets = new Map<string, number>();

  // Hint text
  const hasExpansion = expandedL1.size > 0 || expandedL2.size > 0;
  const hintText = focusedCategory
    ? `Exploring ${focusedCategory} · Click background to reset`
    : hasExpansion
      ? "Click nodes to drill deeper · Click background to reset"
      : "Click a category to explore subcategories";

  // Check if scroll is needed
  const needsScroll = columns.length > 1;

  return (
    <div className="quantra-card p-6 overflow-hidden" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">▸ Cash Flow Explorer</span>
          <span className="text-sm text-muted-foreground">All Accounts</span>
        </div>
        <div className="quantra-chip text-xs">April 2024 ▾</div>
      </div>

      {/* Scrollable Sankey container */}
      <div className="relative">
        {/* Left edge fade */}
        {needsScroll && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
        )}
        {/* Right edge fade */}
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
            {/* Background click catcher */}
            <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="transparent" />

            {/* Flow paths */}
            <AnimatePresence mode="popLayout">
              {links.map((link) => {
                const sourcePos = nodePositions.get(link.sourceId);
                const targetPos = nodePositions.get(link.targetId);
                if (!sourcePos || !targetPos) return null;

                const state = getLinkState(link.sourceId, link.targetId, link.categoryName);
                const sourceTotal = sourceNodeTotals.get(link.sourceId) ?? link.amount;

                // Calculate offset for stacked flows from same source
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

            {/* Nodes per column */}
            {columns.map((col) =>
              col.nodes.map((node) => {
                const pos = nodePositions.get(node.id);
                if (!pos) return null;

                const state = getNodeState(node.id, node.categoryName);
                const hasChildren =
                  node.depth === 0
                    ? (getCategoryByName(node.id)?.children.length ?? 0) > 0
                    : node.depth === 1
                      ? (() => {
                          const parts = node.id.split(">");
                          return (getSubCategoryByName(parts[0], parts[1])?.children.length ?? 0) > 0;
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
                    hasChildren={hasChildren}
                    maxDepth={maxDepth}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => handleNodeHover(node)}
                    onMouseLeave={handleNodeLeave}
                  />
                );
              })
            )}

            {/* Total bar on the right side of column 0 */}
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

      {/* Tooltip */}
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

      {/* Hint text */}
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
