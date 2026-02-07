import { motion } from "framer-motion";
import { LEFT_X } from "./useSankeyLayout";
import type { BarPosition } from "./useSankeyLayout";

interface SankeyNodeProps {
  itemKey: string;
  label: string;
  amount: number;
  color: string;
  isSub: boolean;
  parentName: string;
  index: number;
  position: BarPosition;
  isFocused: boolean;
  isFaded: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const SankeyNode = ({
  label,
  amount,
  color,
  isSub,
  index,
  position,
  isFocused,
  isFaded,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: SankeyNodeProps) => {
  const barWidth = isFocused ? 6 : isHovered ? 5 : 4;

  return (
    <g
      className="cursor-pointer"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left accent bar */}
      <motion.rect
        x={LEFT_X - barWidth}
        width={barWidth}
        rx={barWidth / 2}
        fill={color}
        initial={{ scaleY: 0, y: position.y, height: position.height }}
        animate={{
          scaleY: 1,
          y: position.y,
          height: position.height,
          opacity: isFaded ? 0.25 : 1,
        }}
        transition={{ duration: 0.35, delay: index * 0.02, ease: "easeInOut" }}
        style={{ originY: "0" }}
      />

      {/* Label */}
      <motion.text
        x={LEFT_X - 16}
        textAnchor="end"
        className="text-[13px] font-medium fill-foreground select-none"
        animate={{
          y: position.y + position.height / 2 - 4,
          opacity: isFaded ? 0.3 : 1,
          fontWeight: isFocused ? 700 : 500,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {isSub ? `  ${label}` : label}
      </motion.text>

      {/* Amount */}
      <motion.text
        x={LEFT_X - 16}
        textAnchor="end"
        className="text-[11px] fill-muted-foreground select-none"
        animate={{
          y: position.y + position.height / 2 + 12,
          opacity: isFaded ? 0.2 : 0.7,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        ${amount.toLocaleString()}
      </motion.text>

      {/* Invisible hit area */}
      <rect
        x={0}
        y={position.y - 4}
        width={LEFT_X + 10}
        height={position.height + 8}
        fill="transparent"
      />
    </g>
  );
};

export default SankeyNode;
