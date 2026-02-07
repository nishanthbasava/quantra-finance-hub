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
  isSelected: boolean;
  hasChildren: boolean;
  maxDepth: number;
  selectMode: boolean;
  onClick: () => void;
  onSelectClick: () => void;
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
  isSelected,
  hasChildren,
  maxDepth,
  selectMode,
  onClick,
  onSelectClick,
  onMouseEnter,
  onMouseLeave,
}: MultiLevelNodeProps) => {
  const barWidth = isHighlighted ? NODE_WIDTH + 2 : NODE_WIDTH;
  const depthMute = node.depth < maxDepth ? 0.7 : 1;
  const baseOpacity = isFaded ? 0.2 : depthMute;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectMode) {
      onSelectClick();
    } else if (hasChildren) {
      onClick();
    }
  };

  return (
    <g
      className={selectMode ? "cursor-pointer" : hasChildren ? "cursor-pointer" : "cursor-default"}
      onClick={handleClick}
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

      {/* Selection glow */}
      {isSelected && (
        <motion.rect
          x={position.x - 3}
          width={barWidth + 6}
          rx={(barWidth + 6) / 2}
          fill="hsl(42, 92%, 56%)"
          initial={{ y: position.y - 2, height: position.height + 4, opacity: 0 }}
          animate={{
            y: position.y - 2,
            height: position.height + 4,
            opacity: 0.45,
          }}
          transition={{ duration: 0.3 }}
          style={{ filter: "blur(6px)" }}
        />
      )}

      {/* Glow effect on highlight */}
      {isHighlighted && !isSelected && (
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
