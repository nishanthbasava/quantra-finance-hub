import { motion } from "framer-motion";
import type { NodePosition } from "./useMultiLevelLayout";
import { NODE_WIDTH } from "./useMultiLevelLayout";

interface MultiLevelFlowPathProps {
  sourcePos: NodePosition;
  targetPos: NodePosition;
  color: string;
  amount: number;
  sourceTotal: number;
  targetTotal: number;
  isHighlighted: boolean;
  isFaded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function createMultiLevelPath(
  sx: number, sy: number, sh: number,
  tx: number, ty: number, th: number
) {
  const x1 = sx + NODE_WIDTH + 2;
  const x2 = tx - 2;
  const cpx = (x1 + x2) / 2;

  return `
    M ${x1} ${sy}
    C ${cpx} ${sy}, ${cpx} ${ty}, ${x2} ${ty}
    L ${x2} ${ty + th}
    C ${cpx} ${ty + th}, ${cpx} ${sy + sh}, ${x1} ${sy + sh}
    Z
  `;
}

const MultiLevelFlowPath = ({
  sourcePos,
  targetPos,
  color,
  amount,
  sourceTotal,
  targetTotal,
  isHighlighted,
  isFaded,
  onMouseEnter,
  onMouseLeave,
}: MultiLevelFlowPathProps) => {
  // The flow height on source side is proportional to this flow's amount relative to source total
  const sourceFlowH = (amount / sourceTotal) * sourcePos.height;
  const targetFlowH = targetPos.height; // full height on target

  const d = createMultiLevelPath(
    sourcePos.x, sourcePos.y, sourceFlowH,
    targetPos.x, targetPos.y, targetFlowH
  );

  return (
    <motion.path
      d={d}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isFaded ? 0.06 : isHighlighted ? 0.55 : 0.25,
        filter: isHighlighted ? "brightness(1.2)" : "brightness(1)",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
    />
  );
};

export default MultiLevelFlowPath;
