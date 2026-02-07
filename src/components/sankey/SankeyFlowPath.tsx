import { motion } from "framer-motion";
import { LEFT_X, RIGHT_X } from "./useSankeyLayout";

interface SankeyFlowPathProps {
  leftY: number;
  leftH: number;
  rightY: number;
  rightH: number;
  gradientId: string;
  isHighlighted: boolean;
  isFaded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function createFlowPath(leftY: number, leftH: number, rightY: number, rightH: number) {
  const x1 = LEFT_X + 10;
  const x2 = RIGHT_X - 10;
  const cpx = (x1 + x2) / 2;

  return `
    M ${x1} ${leftY}
    C ${cpx} ${leftY}, ${cpx} ${rightY}, ${x2} ${rightY}
    L ${x2} ${rightY + rightH}
    C ${cpx} ${rightY + rightH}, ${cpx} ${leftY + leftH}, ${x1} ${leftY + leftH}
    Z
  `;
}

const SankeyFlowPath = ({
  leftY,
  leftH,
  rightY,
  rightH,
  gradientId,
  isHighlighted,
  isFaded,
  onMouseEnter,
  onMouseLeave,
}: SankeyFlowPathProps) => {
  const d = createFlowPath(leftY, leftH, rightY, rightH);

  return (
    <motion.path
      d={d}
      fill={`url(#${gradientId})`}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isFaded ? 0.12 : isHighlighted ? 1 : 0.7,
        filter: isHighlighted ? "brightness(1.15)" : "brightness(1)",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="cursor-pointer"
      style={{ transition: "filter 0.2s" }}
    />
  );
};

export default SankeyFlowPath;
