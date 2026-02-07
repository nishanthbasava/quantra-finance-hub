import { motion } from "framer-motion";
import type { NodePosition, SankeyColumnNode } from "./useMultiLevelLayout";
import { NODE_WIDTH } from "./useMultiLevelLayout";

interface MultiLevelNodeProps {
  node: SankeyColumnNode;
  position: NodePosition;
  isHighlighted: boolean;
  isFaded: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  maxDepth: number;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const MultiLevelNode = ({
  node,
  position,
  isHighlighted,
  isFaded,
  isHovered,
  isExpanded,
  hasChildren,
  maxDepth,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MultiLevelNodeProps) => {
  const barWidth = isHighlighted ? NODE_WIDTH + 2 : NODE_WIDTH;
  const depthMute = node.depth < maxDepth ? 0.7 : 1;
  const baseOpacity = isFaded ? 0.2 : depthMute;

  return (
    <g
      className={hasChildren ? "cursor-pointer" : "cursor-default"}
      onClick={(e) => {
        e.stopPropagation();
        if (hasChildren) onClick();
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Node bar */}
      <motion.rect
        x={position.x}
        width={barWidth}
        rx={barWidth / 2}
        fill={node.color}
        initial={{ y: position.y, height: position.height, opacity: 0 }}
        animate={{
          y: position.y,
          height: position.height,
          opacity: isFaded ? 0.2 : isHighlighted ? 1 : baseOpacity,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      />

      {/* Glow effect on highlight */}
      {isHighlighted && (
        <motion.rect
          x={position.x - 2}
          width={barWidth + 4}
          rx={(barWidth + 4) / 2}
          fill={node.color}
          initial={{ y: position.y, height: position.height, opacity: 0 }}
          animate={{
            y: position.y,
            height: position.height,
            opacity: 0.25,
          }}
          transition={{ duration: 0.3 }}
          style={{ filter: "blur(6px)" }}
        />
      )}

      {/* Label - to the left of the node */}
      <motion.text
        x={position.x - 10}
        textAnchor="end"
        className="text-[12px] font-medium fill-foreground select-none"
        initial={{ y: position.y + position.height / 2 - 2, opacity: 0 }}
        animate={{
          y: position.y + position.height / 2 - 2,
          opacity: isFaded ? 0.25 : isHighlighted ? 1 : baseOpacity,
          fontWeight: isHighlighted ? 700 : 500,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {node.label}
      </motion.text>

      {/* Amount */}
      <motion.text
        x={position.x - 10}
        textAnchor="end"
        className="text-[10px] fill-muted-foreground select-none"
        initial={{ y: position.y + position.height / 2 + 12, opacity: 0 }}
        animate={{
          y: position.y + position.height / 2 + 12,
          opacity: isFaded ? 0.15 : isHighlighted ? 0.85 : 0.5 * depthMute,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        ${node.amount.toLocaleString()}
      </motion.text>

      {/* Expand indicator */}
      {hasChildren && (
        <motion.text
          x={position.x + NODE_WIDTH + 8}
          className="text-[9px] fill-muted-foreground select-none"
          initial={{ y: position.y + position.height / 2 + 3, opacity: 0 }}
          animate={{
            y: position.y + position.height / 2 + 3,
            opacity: isFaded ? 0.1 : isExpanded ? 0.5 : 0.35,
          }}
          transition={{ duration: 0.3 }}
        >
          {isExpanded ? "◂" : "▸"}
        </motion.text>
      )}

      {/* Invisible hit area */}
      <rect
        x={position.x - 130}
        y={position.y - 6}
        width={160}
        height={position.height + 12}
        fill="transparent"
      />
    </g>
  );
};

export default MultiLevelNode;
