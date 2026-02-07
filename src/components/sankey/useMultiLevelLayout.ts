import { useMemo } from "react";
import { categories, totalExpenses, type Category, type SubCategory } from "./sankeyData";

// A node in the Sankey at any level
export interface SankeyColumnNode {
  id: string; // unique key, e.g. "Food" or "Food>Groceries" or "Food>Groceries>Trader Joe's"
  label: string;
  amount: number;
  color: string;
  parentId: string | null;
  categoryName: string; // root category name for color lookup
  depth: number; // 0, 1, or 2
}

export interface ColumnData {
  depth: number;
  nodes: SankeyColumnNode[];
  x: number; // horizontal position
}

export interface FlowLink {
  sourceId: string;
  targetId: string;
  amount: number;
  color: string;
  categoryName: string;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Layout constants
const NODE_WIDTH = 8;
const COLUMN_WIDTH = 260;
const LABEL_AREA = 140;
const COLUMN_SPACING = COLUMN_WIDTH;
const MIN_NODE_HEIGHT = 14;
const BASE_GAP = 12;
const DEPTH_GAP_MULTIPLIER = 1.4;

export { COLUMN_WIDTH, COLUMN_SPACING, LABEL_AREA, NODE_WIDTH };

export function useMultiLevelLayout(
  expandedLevel1: Set<string>, // expanded category names
  expandedLevel2: Set<string>  // expanded subcategory ids like "Food>Groceries"
) {
  // Build columns based on expansion state
  const columns = useMemo(() => {
    const cols: ColumnData[] = [];

    // Column 0: top-level categories (always visible)
    const col0Nodes: SankeyColumnNode[] = categories.map((cat) => ({
      id: cat.name,
      label: cat.name,
      amount: cat.amount,
      color: cat.color,
      parentId: null,
      categoryName: cat.name,
      depth: 0,
    }));
    cols.push({ depth: 0, nodes: col0Nodes, x: 0 });

    // Column 1: subcategories of expanded categories
    const col1Nodes: SankeyColumnNode[] = [];
    categories.forEach((cat) => {
      if (expandedLevel1.has(cat.name)) {
        cat.children.forEach((sub) => {
          col1Nodes.push({
            id: `${cat.name}>${sub.name}`,
            label: sub.name,
            amount: sub.amount,
            color: cat.color,
            parentId: cat.name,
            categoryName: cat.name,
            depth: 1,
          });
        });
      }
    });
    if (col1Nodes.length > 0) {
      cols.push({ depth: 1, nodes: col1Nodes, x: COLUMN_SPACING });
    }

    // Column 2: sub-subcategories of expanded subcategories
    const col2Nodes: SankeyColumnNode[] = [];
    categories.forEach((cat) => {
      if (expandedLevel1.has(cat.name)) {
        cat.children.forEach((sub) => {
          const subId = `${cat.name}>${sub.name}`;
          if (expandedLevel2.has(subId)) {
            sub.children.forEach((subsub) => {
              col2Nodes.push({
                id: `${subId}>${subsub.name}`,
                label: subsub.name,
                amount: subsub.amount,
                color: cat.color,
                parentId: subId,
                categoryName: cat.name,
                depth: 2,
              });
            });
          }
        });
      }
    });
    if (col2Nodes.length > 0) {
      cols.push({ depth: 2, nodes: col2Nodes, x: COLUMN_SPACING * 2 });
    }

    return cols;
  }, [expandedLevel1, expandedLevel2]);

  // Build flow links between adjacent columns
  const links = useMemo(() => {
    const result: FlowLink[] = [];
    for (let c = 0; c < columns.length - 1; c++) {
      const rightCol = columns[c + 1];
      rightCol.nodes.forEach((node) => {
        result.push({
          sourceId: node.parentId!,
          targetId: node.id,
          amount: node.amount,
          color: node.color,
          categoryName: node.categoryName,
        });
      });
    }
    return result;
  }, [columns]);

  // Calculate node positions
  const { nodePositions, svgHeight } = useMemo(() => {
    const positions: Map<string, NodePosition> = new Map();
    let maxHeight = 400;

    columns.forEach((col) => {
      const gap = BASE_GAP * Math.pow(DEPTH_GAP_MULTIPLIER, col.depth);
      const totalAmount = col.nodes.reduce((s, n) => s + n.amount, 0);
      const totalGaps = (col.nodes.length - 1) * gap;
      const baseAvailableHeight = Math.max(350, col.nodes.length * 50 + totalGaps + 40);
      const availableForNodes = baseAvailableHeight - totalGaps - 40;

      let yOffset = 20;
      col.nodes.forEach((node) => {
        const h = Math.max(MIN_NODE_HEIGHT, (node.amount / totalAmount) * availableForNodes);
        positions.set(node.id, {
          id: node.id,
          x: col.x + LABEL_AREA,
          y: yOffset,
          width: NODE_WIDTH,
          height: h,
        });
        yOffset += h + gap;
      });

      maxHeight = Math.max(maxHeight, yOffset + 20);
    });

    return { nodePositions: positions, svgHeight: maxHeight };
  }, [columns]);

  // Total SVG width
  const svgWidth = useMemo(() => {
    return LABEL_AREA + (columns.length) * COLUMN_SPACING + 80;
  }, [columns]);

  // Determine the max depth visible
  const maxDepth = columns.length > 0 ? columns[columns.length - 1].depth : 0;

  return { columns, links, nodePositions, svgHeight, svgWidth, totalExpenses, maxDepth };
}
