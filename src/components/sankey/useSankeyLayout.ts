import { useMemo } from "react";
import { categories, totalExpenses, type FlowItem } from "./sankeyData";

export interface BarPosition {
  y: number;
  height: number;
}

export interface SankeyLayout {
  flowItems: FlowItem[];
  barPositions: BarPosition[];
  rightFlowPositions: BarPosition[];
  svgHeight: number;
  totalAmount: number;
}

const SVG_WIDTH = 700;
const LEFT_X = 200;
const RIGHT_X = SVG_WIDTH - 80;
const COLLAPSED_GAP = 10;
const EXPANDED_GAP = 22;
const RIGHT_BAR_Y = 20;

export { SVG_WIDTH, LEFT_X, RIGHT_X, COLLAPSED_GAP, EXPANDED_GAP, RIGHT_BAR_Y };

export function useSankeyLayout(expandedCategories: Set<string>): SankeyLayout {
  const flowItems = useMemo(() => {
    const items: FlowItem[] = [];
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

  // Calculate total gap space needed
  const totalGapSpace = useMemo(() => {
    let gap = 0;
    for (let i = 0; i < flowItems.length - 1; i++) {
      gap += flowItems[i].isSub || flowItems[i + 1]?.isSub ? EXPANDED_GAP : COLLAPSED_GAP;
    }
    return gap;
  }, [flowItems]);

  const svgHeight = Math.max(400, flowItems.length * 48 + totalGapSpace + 60);
  const availableHeight = svgHeight - 40;
  const totalAmount = flowItems.reduce((s, i) => s + i.amount, 0);
  const rightBarHeight = availableHeight - COLLAPSED_GAP;

  const barPositions = useMemo(() => {
    const usableHeight = availableHeight - totalGapSpace;
    let yOffset = 20;
    return flowItems.map((item, i) => {
      const h = Math.max(16, (item.amount / totalAmount) * usableHeight);
      const pos = { y: yOffset, height: h };
      const nextGap = i < flowItems.length - 1
        ? (item.isSub || flowItems[i + 1]?.isSub ? EXPANDED_GAP : COLLAPSED_GAP)
        : 0;
      yOffset += h + nextGap;
      return pos;
    });
  }, [flowItems, totalAmount, availableHeight, totalGapSpace]);

  const rightFlowPositions = useMemo(() => {
    let rOffset = RIGHT_BAR_Y;
    return flowItems.map((item) => {
      const h = (item.amount / totalAmount) * rightBarHeight;
      const pos = { y: rOffset, height: h };
      rOffset += h;
      return pos;
    });
  }, [flowItems, totalAmount, rightBarHeight]);

  return { flowItems, barPositions, rightFlowPositions, svgHeight, totalAmount };
}
