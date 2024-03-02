import React, { type ComponentType } from 'react';
import { getBezierPath, getMarkerEnd, type EdgeProps, MarkerType } from 'reactflow';

// 自定义边缘组件
const BorderEdge: ComponentType<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  style,
}) => {
  const offset = 16; // 偏移量
  const adjustedSourceX = sourceX + offset;
  const adjustedSourceY = sourceY + offset;
  const adjustedTargetX = targetX - offset;
  const adjustedTargetY = targetY - offset;
  const edgePath = getBezierPath({
    sourceX: adjustedSourceX,
    sourceY: adjustedSourceY,
    targetX: adjustedTargetX,
    targetY: adjustedTargetY, sourcePosition, targetPosition
  });
  const markerEndId = getMarkerEnd(markerEnd as MarkerType | undefined, id);
  // 根据边缘的选中状态调整样式
  const stroke = data.isSelected ? '4px' : '2px';
  const edgeStyle = { ...style, strokeWidth: stroke };

  return (
    <path
      className="react-flow__edge-path"
      d={edgePath.join('')} // Convert edgePath array to string
      markerEnd={markerEndId}
      style={edgeStyle}
    />
  );
};

export default BorderEdge;