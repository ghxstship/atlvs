'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDataView } from './DataViewProvider';
import { Button } from '../Button';
import { Select } from '../Select';
import { Input } from '../Input';
import { Card } from '../Card';
import { Badge } from '../Badge';
import { 
  Pen, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Eraser,
  Undo,
  Redo,
  Download,
  Upload,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  Hand,
  Palette,
  Settings
} from 'lucide-react';
import { DataRecord } from './types';

interface WhiteboardViewProps {
  className?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  gridEnabled?: boolean;
  snapToGrid?: boolean;
  allowCollaboration?: boolean;
  readOnly?: boolean;
}

interface DrawingElement {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'sticky';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: number[];
  text?: string;
  color: string;
  strokeWidth: number;
  fill?: string;
  fontSize?: number;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WhiteboardState {
  elements: DrawingElement[];
  selectedTool: string;
  selectedColor: string;
  strokeWidth: number;
  fontSize: number;
  zoom: number;
  panX: number;
  panY: number;
  selectedElements: string[];
}

type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'sticky' | 'eraser' | 'pan';

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'
];

const STROKE_WIDTHS = [1, 2, 4, 8, 12];

export function WhiteboardView({
  className = '',
  width = 1200,
  height = 800,
  backgroundColor = '#FFFFFF',
  gridEnabled = true,
  snapToGrid = false,
  allowCollaboration = true,
  readOnly = false
}: WhiteboardViewProps) {
  const { state, config, actions } = useDataView();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [whiteboardState, setWhiteboardState] = useState<WhiteboardState>({
    elements: [],
    selectedTool: 'pen',
    selectedColor: '#000000',
    strokeWidth: 2,
    fontSize: 16,
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedElements: []
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [history, setHistory] = useState<DrawingElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear and redraw
    redrawCanvas();
  }, [width, height, whiteboardState.elements, whiteboardState.zoom, whiteboardState.panX, whiteboardState.panY]);

  // Redraw canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (gridEnabled) {
      drawGrid(ctx);
    }

    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(whiteboardState.zoom, whiteboardState.zoom);
    ctx.translate(whiteboardState.panX, whiteboardState.panY);

    // Draw all elements
    whiteboardState.elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current element being created
    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    ctx.restore();

    // Draw selection indicators
    drawSelectionIndicators(ctx);
  }, [whiteboardState, currentElement, backgroundColor, gridEnabled]);

  // Draw grid
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const gridSize = 20;
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [width, height]);

  // Draw individual element
  const drawElement = useCallback((ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.fillStyle = element.fill || element.color;
    ctx.setLineDash([]);

    switch (element.type) {
      case 'pen':
        if (element.points && element.points.length > 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0], element.points[1]);
          for (let i = 2; i < element.points.length; i += 2) {
            ctx.lineTo(element.points[i], element.points[i + 1]);
          }
          ctx.stroke();
        }
        break;

      case 'rectangle':
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width || 0, element.height || 0);
        if (element.fill) ctx.fill();
        ctx.stroke();
        break;

      case 'circle':
        const radius = Math.min(Math.abs(element.width || 0), Math.abs(element.height || 0)) / 2;
        ctx.beginPath();
        ctx.arc(
          element.x + (element.width || 0) / 2,
          element.y + (element.height || 0) / 2,
          radius,
          0,
          2 * Math.PI
        );
        if (element.fill) ctx.fill();
        ctx.stroke();
        break;

      case 'arrow':
        drawArrow(ctx, element.x, element.y, element.x + (element.width || 0), element.y + (element.height || 0));
        break;

      case 'text':
        ctx.font = `${element.fontSize || 16}px Arial`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.text || '', element.x, element.y);
        break;

      case 'sticky':
        // Draw sticky note background
        ctx.fillStyle = element.fill || '#FFEB3B';
        ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100);
        ctx.strokeRect(element.x, element.y, element.width || 100, element.height || 100);
        
        // Draw text
        if (element.text) {
          ctx.fillStyle = '#000000';
          ctx.font = `${element.fontSize || 14}px Arial`;
          const lines = element.text.split('\n');
          lines.forEach((line, index) => {
            ctx.fillText(line, element.x + 8, element.y + 20 + index * 18);
          });
        }
        break;
    }
  }, []);

  // Draw arrow
  const drawArrow = useCallback((ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  }, []);

  // Draw selection indicators
  const drawSelectionIndicators = useCallback((ctx: CanvasRenderingContext2D) => {
    whiteboardState.selectedElements.forEach(elementId => {
      const element = whiteboardState.elements.find(el => el.id === elementId);
      if (!element) return;

      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const bounds = getElementBounds(element);
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);
    });
  }, [whiteboardState.selectedElements, whiteboardState.elements]);

  // Get element bounds
  const getElementBounds = useCallback((element: DrawingElement) => {
    switch (element.type) {
      case 'pen':
        if (!element.points || element.points.length < 2) return { x: 0, y: 0, width: 0, height: 0 };
        const minX = Math.min(...element.points.filter((_, i) => i % 2 === 0));
        const maxX = Math.max(...element.points.filter((_, i) => i % 2 === 0));
        const minY = Math.min(...element.points.filter((_, i) => i % 2 === 1));
        const maxY = Math.max(...element.points.filter((_, i) => i % 2 === 1));
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      
      default:
        return {
          x: element.x,
          y: element.y,
          width: element.width || 0,
          height: element.height || 0
        };
    }
  }, []);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / whiteboardState.zoom - whiteboardState.panX;
    const y = (e.clientY - rect.top) / whiteboardState.zoom - whiteboardState.panY;

    if (snapToGrid) {
      // Snap to 20px grid
      const gridSize = 20;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
    }

    setIsDrawing(true);

    const newElement: DrawingElement = {
      id: `element-${Date.now()}-${Math.random()}`,
      type: whiteboardState.selectedTool as any,
      x,
      y,
      color: whiteboardState.selectedColor,
      strokeWidth: whiteboardState.strokeWidth,
      fontSize: whiteboardState.fontSize,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (whiteboardState.selectedTool === 'pen') {
      newElement.points = [x, y];
    } else if (whiteboardState.selectedTool === 'sticky') {
      newElement.width = 100;
      newElement.height = 100;
      newElement.fill = '#FFEB3B';
      newElement.text = 'New note';
    }

    setCurrentElement(newElement);
  }, [whiteboardState, readOnly, snapToGrid]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement || readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / whiteboardState.zoom - whiteboardState.panX;
    const y = (e.clientY - rect.top) / whiteboardState.zoom - whiteboardState.panY;

    const updatedElement = { ...currentElement };

    if (currentElement.type === 'pen') {
      if (updatedElement.points) {
        updatedElement.points.push(x, y);
      }
    } else {
      updatedElement.width = x - currentElement.x;
      updatedElement.height = y - currentElement.y;
    }

    updatedElement.updatedAt = new Date();
    setCurrentElement(updatedElement);
  }, [isDrawing, currentElement, whiteboardState, readOnly]);

  const handleMouseUp = useCallback(() => {
    if (!currentElement || readOnly) return;

    // Add element to whiteboard
    setWhiteboardState(prev => ({
      ...prev,
      elements: [...prev.elements, currentElement]
    }));

    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...whiteboardState.elements, currentElement]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCurrentElement(null);
    setIsDrawing(false);
  }, [currentElement, whiteboardState.elements, history, historyIndex, readOnly]);

  // Tool selection
  const selectTool = useCallback((tool: Tool) => {
    setWhiteboardState(prev => ({ ...prev, selectedTool: tool }));
  }, []);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setWhiteboardState(prev => ({ ...prev, elements: history[newIndex] || [] }));
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setWhiteboardState(prev => ({ ...prev, elements: history[newIndex] || [] }));
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // Clear whiteboard
  const clearWhiteboard = useCallback(() => {
    if (readOnly) return;
    
    setWhiteboardState(prev => ({ ...prev, elements: [] }));
    const newHistory = [...history, []];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, readOnly]);

  // Export whiteboard
  const exportWhiteboard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  const containerClasses = `
    whiteboard-view h-full flex flex-col bg-background border border-border rounded-lg overflow-hidden
    ${className}
  `.trim();

  return (
    <div className={containerClasses}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {/* Tool Selection */}
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border">
            {[
              { tool: 'select', icon: Move, label: 'Select' },
              { tool: 'pen', icon: Pen, label: 'Pen' },
              { tool: 'rectangle', icon: Square, label: 'Rectangle' },
              { tool: 'circle', icon: Circle, label: 'Circle' },
              { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
              { tool: 'text', icon: Type, label: 'Text' },
              { tool: 'sticky', icon: Square, label: 'Sticky Note' },
              { tool: 'eraser', icon: Eraser, label: 'Eraser' },
              { tool: 'pan', icon: Hand, label: 'Pan' }
            ].map(({ tool, icon: Icon, label }) => (
              <Button
                key={tool}
                variant={whiteboardState.selectedTool === tool ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => selectTool(tool as Tool)}
                title={label}
                disabled={readOnly && tool !== 'select' && tool !== 'pan'}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border">
            {COLORS.map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  whiteboardState.selectedColor === color ? 'border-primary' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setWhiteboardState(prev => ({ ...prev, selectedColor: color }))}
                disabled={readOnly}
              />
            ))}
          </div>

          {/* Stroke Width */}
          <Select
            value={whiteboardState.strokeWidth.toString()}
            onChange={(e) => setWhiteboardState(prev => ({ ...prev, strokeWidth: Number(e.target.value) }))}
            disabled={readOnly}
          >
            {STROKE_WIDTHS.map(width => (
              <option key={width} value={width.toString()}>
                {width}px
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0 || readOnly}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1 || readOnly}
          >
            <Redo className="h-4 w-4" />
          </Button>

          {/* Zoom Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWhiteboardState(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3) }))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWhiteboardState(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={exportWhiteboard}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          {!readOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearWhiteboard}
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />

        {/* Status Bar */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 border border-border">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Elements: {whiteboardState.elements.length}</span>
            <span>Zoom: {Math.round(whiteboardState.zoom * 100)}%</span>
            <span>Tool: {whiteboardState.selectedTool}</span>
            {allowCollaboration && (
              <Badge variant="secondary" size="sm">
                Collaborative
              </Badge>
            )}
            {readOnly && (
              <Badge variant="outline" size="sm">
                Read Only
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
