
import React, { useState, useEffect, useRef } from 'react';
import { IChartApi, ISeriesApi } from 'lightweight-charts';

interface Point {
  time: number | string;
  price: number;
}

interface Drawing {
  id: string;
  type: 'line' | 'horizontal' | 'vertical' | 'rectangle' | 'trend' | 'fibo' | 'ray';
  points: Point[];
  color: string;
  width: number;
}

interface DrawingOverlayProps {
  chart: IChartApi | null;
  series: ISeriesApi<any> | null;
  drawings: Drawing[];
  setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>;
  selectedTool: string | null;
  setSelectedTool: (tool: string | null) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DrawingOverlay: React.FC<DrawingOverlayProps> = ({
  chart,
  series,
  drawings,
  setDrawings,
  selectedTool,
  setSelectedTool,
  containerRef,
}) => {
  const [activeDrawing, setActiveDrawing] = useState<Drawing | null>(null);
  const [draggingNode, setDraggingNode] = useState<{ drawingId: string, pointIndex: number, type: 'node' | 'body' } | null>(null);
  const [dragOffset, setDragOffset] = useState<Point | null>(null);
  const [, forceUpdate] = useState({});
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!chart) return;
    const handleVisibleRangeChange = () => {
        forceUpdate({});
    };
    chart.timeScale().subscribeVisibleTimeRangeChange(handleVisibleRangeChange);
    return () => {
        chart.timeScale().unsubscribeVisibleTimeRangeChange(handleVisibleRangeChange);
    };
  }, [chart]);

  useEffect(() => {
    if (!selectedTool) {
        setActiveDrawing(null);
    }
  }, [selectedTool]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current || !chart || !series) return null;
    const rect = containerRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        return null;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const price = series.coordinateToPrice(y);
    const time = chart.timeScale().coordinateToTime(x);

    if (price === null || time === null) return null;
    return { x, y, price, time: (time as any) };
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!selectedTool || !chart) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const newPoint: Point = { time: coords.time, price: coords.price };

    if (selectedTool === 'horizontal' || selectedTool === 'vertical') {
        const newDrawing: Drawing = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedTool as any,
            points: [newPoint],
            color: '#FFE24C',
            width: 2,
        };
        setDrawings([...drawings, newDrawing]);
        setSelectedTool(null);
    } else if (selectedTool === 'trend' || selectedTool === 'rectangle' || selectedTool === 'fibo' || selectedTool === 'ray') {
        const newDrawing: Drawing = {
            id: Math.random().toString(36).substr(2, 9),
            type: selectedTool as any,
            points: [newPoint, newPoint],
            color: '#FFE24C',
            width: 2,
        };
        setActiveDrawing(newDrawing);
    }
  };

  const handleMouseDownOnHandle = (e: React.MouseEvent | React.TouchEvent, drawingId: string, pointIndex: number) => {
      if (selectedTool) return;
      e.stopPropagation();
      setDraggingNode({ drawingId, pointIndex, type: 'node' });
  };

  const handleMouseDownOnBody = (e: React.MouseEvent | React.TouchEvent, drawingId: string) => {
      if (selectedTool) return;
      e.stopPropagation();
      const coords = getCoordinates(e);
      if (coords) {
          setDragOffset({ time: coords.time, price: coords.price });
      }
      setDraggingNode({ drawingId, pointIndex: 0, type: 'body' });
  };

  const handleRightClick = (e: React.MouseEvent | React.TouchEvent, drawingId: string) => {
      if (selectedTool) return;
      e.preventDefault();
      e.stopPropagation();
      setDrawings(prev => prev.filter(d => d.id !== drawingId));
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeDrawing && chart) {
        const coords = getCoordinates(e);
        if (!coords) return;
        const updatedDrawing = {
            ...activeDrawing,
            points: [activeDrawing.points[0], { time: coords.time, price: coords.price }],
        };
        setActiveDrawing(updatedDrawing);
        return;
    }

    if (draggingNode && chart) {
        const coords = getCoordinates(e);
        if (!coords) return;

        setDrawings(prev => prev.map(d => {
            if (d.id !== draggingNode.drawingId) return d;
            
            const newPoints = [...d.points];
            if (draggingNode.type === 'node') {
                if (d.type === 'horizontal') {
                    newPoints[draggingNode.pointIndex] = { ...newPoints[draggingNode.pointIndex], price: coords.price };
                } else if (d.type === 'vertical') {
                    newPoints[draggingNode.pointIndex] = { ...newPoints[draggingNode.pointIndex], time: coords.time };
                } else {
                    newPoints[draggingNode.pointIndex] = { time: coords.time, price: coords.price };
                }
            } else if (draggingNode.type === 'body' && dragOffset) {
                const diffPrice = coords.price - dragOffset.price;
                const newPoints = d.points.map(p => {
                    const updatedPoint = { ...p, price: p.price + diffPrice };
                    if (typeof p.time === 'number' && typeof dragOffset.time === 'number' && typeof coords.time === 'number') {
                        updatedPoint.time = p.time + (coords.time - dragOffset.time);
                    } else {
                        updatedPoint.time = p.time;
                    }
                    return updatedPoint;
                });
                setDragOffset({ time: coords.time, price: coords.price });
                return { ...d, points: newPoints };
            }
            return { ...d, points: newPoints };
        }));
    }
  };

  const handleMouseUp = () => {
    if (activeDrawing) {
        setDrawings([...drawings, activeDrawing]);
        setActiveDrawing(null);
        setSelectedTool(null);
    }
    if (draggingNode) {
        setDraggingNode(null);
    }
  };

  const renderDrawing = (drawing: Drawing, isGhost = false) => {
    if (!chart || !containerRef.current) return null;

    const points = drawing.points.map(p => {
        const x = chart.timeScale().timeToCoordinate(p.time as any);
        const y = series.priceToCoordinate(p.price);
        return { x, y };
    });

    if (points.length === 0 || points.some(p => p.x === null || p.y === null)) return null;

    const style = {
        stroke: drawing.color,
        strokeWidth: drawing.width,
        opacity: isGhost ? 0.5 : 1,
        fill: 'none',
    };

    const hitAreaWidth = 12;
    const isEditing = !selectedTool && !isGhost;

    let element = null;

    if (drawing.type === 'horizontal') {
        const y = points[0].y!;
        element = (
            <>
                <line x1="0" y1={y} x2="100%" y2={y} {...style} />
                <line x1="0" y1={y} x2="100%" y2={y} stroke="transparent" strokeWidth={hitAreaWidth} cursor={isEditing ? "ns-resize" : "default"} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} style={{ touchAction: 'none' }} />
                {isEditing && <circle cx="50%" cy={y} r={8} fill={drawing.color} cursor="ns-resize" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, 0)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, 0)} style={{ touchAction: 'none' }} />}
            </>
        );
    } else if (drawing.type === 'vertical') {
        const x = points[0].x!;
        element = (
            <>
                <line x1={x} y1="0" x2={x} y2="100%" {...style} />
                <line x1={x} y1="0" x2={x} y2="100%" stroke="transparent" strokeWidth={hitAreaWidth} cursor={isEditing ? "ew-resize" : "default"} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} style={{ touchAction: 'none' }} />
                {isEditing && <circle cx={x} cy="50%" r={8} fill={drawing.color} cursor="ew-resize" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, 0)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, 0)} style={{ touchAction: 'none' }} />}
            </>
        );
    } else if (drawing.type === 'trend') {
        const x1 = points[0].x!;
        const y1 = points[0].y!;
        const x2 = points[1].x!;
        const y2 = points[1].y!;
        element = (
            <>
                <line x1={x1} y1={y1} x2={x2} y2={y2} {...style} />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={hitAreaWidth} onContextMenu={(e) => handleRightClick(e, drawing.id)} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} cursor={isEditing ? "move" : "default"} style={{ touchAction: 'none' }} />
                {isEditing && points.map((p, i) => (
                    <circle key={i} cx={p.x!} cy={p.y!} r={8} fill={drawing.color} cursor="move" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, i)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, i)} style={{ touchAction: 'none' }} />
                ))}
            </>
        );
    } else if (drawing.type === 'ray') {
        const x1 = points[0].x!;
        const y1 = points[0].y!;
        const x2 = points[1].x!;
        const y2 = points[1].y!;
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        let targetX = x1;
        let targetY = dy > 0 ? 2000 : -500;
        if (Math.abs(dx) >= 0.1) {
            const slope = dy / dx;
            targetX = dx > 0 ? 2000 : -500;
            targetY = y1 + (targetX - x1) * slope;
        }
        
        element = (
            <>
                <line x1={x1} y1={y1} x2={targetX} y2={targetY} {...style} />
                <line x1={x1} y1={y1} x2={targetX} y2={targetY} stroke="transparent" strokeWidth={hitAreaWidth} onContextMenu={(e) => handleRightClick(e, drawing.id)} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} cursor={isEditing ? "move" : "default"} style={{ touchAction: 'none' }} />
                {isEditing && points.map((p, i) => (
                    <circle key={i} cx={p.x!} cy={p.y!} r={8} fill={drawing.color} cursor="move" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, i)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, i)} style={{ touchAction: 'none' }} />
                ))}
            </>
        );
    } else if (drawing.type === 'rectangle') {
        const x = Math.min(points[0].x!, points[1].x!);
        const y = Math.min(points[0].y!, points[1].y!);
        const width = Math.abs(points[0].x! - points[1].x!);
        const height = Math.abs(points[0].y! - points[1].y!);
        element = (
            <>
                <rect x={x} y={y} width={width} height={height} {...style} fill={`${drawing.color}15`} onContextMenu={(e) => handleRightClick(e, drawing.id)} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} cursor={isEditing ? "move" : "default"} style={{ touchAction: 'none' }} />
                <rect x={x} y={y} width={width} height={height} fill="transparent" stroke="none" onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} cursor={isEditing ? "move" : "default"} style={{ touchAction: 'none' }} />
                {isEditing && points.map((p, i) => (
                    <circle key={i} cx={p.x!} cy={p.y!} r={8} fill={drawing.color} cursor="move" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, i)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, i)} style={{ touchAction: 'none' }} />
                ))}
            </>
        );
    } else if (drawing.type === 'fibo') {
        if (!points[0] || !points[1] || drawing.points.length < 2) return null;
        const p1 = points[0];
        const p2 = points[1];
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        const minPrice = Math.min(drawing.points[0].price, drawing.points[1].price);
        const maxPrice = Math.max(drawing.points[0].price, drawing.points[1].price);
        const diff = maxPrice - minPrice;

        element = (
            <>
                <line x1={p1.x!} y1={p1.y!} x2={p2.x!} y2={p2.y!} {...style} strokeDasharray="4" onContextMenu={(e) => handleRightClick(e, drawing.id)} />
                <line x1={p1.x!} y1={p1.y!} x2={p2.x!} y2={p2.y!} stroke="transparent" strokeWidth={hitAreaWidth} onContextMenu={(e) => handleRightClick(e, drawing.id)} onMouseDown={(e) => handleMouseDownOnBody(e, drawing.id)} onTouchStart={(e) => handleMouseDownOnBody(e, drawing.id)} cursor={isEditing ? "move" : "default"} style={{ touchAction: 'none' }} />
                {levels.map(level => {
                    const price = drawing.points[1].price > drawing.points[0].price 
                        ? maxPrice - (diff * level)
                        : minPrice + (diff * level);
                    const y = series.priceToCoordinate(price);
                    if (y === null) return null;
                    return (
                        <g key={level}>
                            <line x1="0" y1={y} x2="100%" y2={y} {...style} strokeWidth={1} opacity={0.3} />
                            <text x="5" y={y - 5} fill={drawing.color} fontSize="10" opacity={0.6}>
                                {level} ({price.toFixed(5)})
                            </text>
                        </g>
                    );
                })}
                {isEditing && points.map((p, i) => (
                    <circle key={i} cx={p.x!} cy={p.y!} r={8} fill={drawing.color} cursor="move" onMouseDown={(e) => handleMouseDownOnHandle(e, drawing.id, i)} onTouchStart={(e) => handleMouseDownOnHandle(e, drawing.id, i)} style={{ touchAction: 'none' }} />
                ))}
            </>
        );
    }

    if (!element) return null;

    return (
        <g key={drawing.id} pointerEvents={isEditing ? "auto" : "none"}>
            {element}
        </g>
    );
  };

  const isInteractive = !!(selectedTool || activeDrawing || draggingNode);

  return (
    <svg
      ref={svgRef}
      className={`absolute inset-0 z-30`}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchCancel={handleMouseUp}
    >
      {/* Invisible layer to catch drawing start ONLY when a tool is selected */}
      {selectedTool && (
          <rect 
            width="100%" 
            height="100%" 
            fill="transparent" 
            style={{ pointerEvents: 'auto', cursor: 'crosshair', touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            onContextMenu={(e) => e.preventDefault()}
          />
      )}

      {/* Global tracker for dragging existing elements */}
      {draggingNode && (
          <rect 
            width="100%" 
            height="100%" 
            fill="transparent" 
            style={{ pointerEvents: 'auto', touchAction: 'none' }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
          />
      )}

      {drawings.map(d => renderDrawing(d))}
      {activeDrawing && renderDrawing(activeDrawing, true)}
    </svg>
  );
};
