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
const FLOW_GAP = 4;
const RIGHT_BAR_Y = 20;

export { SVG_WIDTH, LEFT_X, RIGHT_X, FLOW_GAP, RIGHT_BAR_Y };

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

  const svgHeight = Math.max(400, flowItems.length * 52 + 40);
  const availableHeight = svgHeight - 40;
  const totalAmount = flowItems.reduce((s, i) => s + i.amount, 0);
  const rightBarHeight = availableHeight - FLOW_GAP;

  const barPositions = useMemo(() => {
    let yOffset = 20;
    return flowItems.map((item) => {
      const h = Math.max(12, (item.amount / totalAmount) * availableHeight - FLOW_GAP);
      const pos = { y: yOffset, height: h };
      yOffset += h + FLOW_GAP;
      return pos;
    });
  }, [flowItems, totalAmount, availableHeight]);

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
