'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '../../utils';

// 3D Visualization types
interface Point3D {
  x: number;
  y: number;
  z: number;
  value?: number;
  label?: string;
  color?: string;
  size?: number;
}

interface DataNode {
  id: string;
  position: Point3D;
  connections: string[];
  data: any;
  type: 'metric' | 'category' | 'trend' | 'outlier';
}

interface Spatial3DProps {
  data: DataNode[];
  width?: number;
  height?: number;
  interactive?: boolean;
  showGrid?: boolean;
  showAxes?: boolean;
  cameraPosition?: Point3D;
  className?: string;
}

// 3D Math utilities
class Vector3D {
  constructor(public x: number, public y: number, public z: number) {}

  static subtract(a: Point3D, b: Point3D): Vector3D {
    return new Vector3D(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  static dot(a: Vector3D, b: Vector3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  static cross(a: Vector3D, b: Vector3D): Vector3D {
    return new Vector3D(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  normalize(): Vector3D {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    return new Vector3D(this.x / length, this.y / length, this.z / length);
  }
}

// 3D Camera system
class Camera3D {
  position: Point3D;
  target: Point3D;
  up: Vector3D;
  fov: number;
  near: number;
  far: number;

  constructor(
    position: Point3D = { x: 0, y: 0, z: 5 },
    target: Point3D = { x: 0, y: 0, z: 0 },
    fov: number = 75
  ) {
    this.position = position;
    this.target = target;
    this.up = new Vector3D(0, 1, 0);
    this.fov = fov;
    this.near = 0.1;
    this.far = 1000;
  }

  // Project 3D point to 2D screen coordinates
  project(point: Point3D, width: number, height: number): { x: number; y: number; z: number } {
    // Simple perspective projection
    const distance = Vector3D.subtract(point, this.position);
    const depth = Math.sqrt(distance.x * distance.x + distance.y * distance.y + distance.z * distance.z);
    
    const fovRad = (this.fov * Math.PI) / 180;
    const scale = Math.tan(fovRad / 2) * depth;
    
    const x = (point.x / scale) * (width / 2) + width / 2;
    const y = (-point.y / scale) * (height / 2) + height / 2;
    
    return { x, y, z: depth };
  }

  // Rotate camera around target
  rotate(deltaX: number, deltaY: number) {
    const radius = Vector3D.subtract(this.position, this.target);
    const distance = Math.sqrt(radius.x * radius.x + radius.y * radius.y + radius.z * radius.z);
    
    // Spherical coordinates
    let theta = Math.atan2(radius.x, radius.z);
    let phi = Math.acos(radius.y / distance);
    
    theta += deltaX * 0.01;
    phi += deltaY * 0.01;
    
    // Clamp phi to avoid gimbal lock
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    
    this.position = {
      x: this.target.x + distance * Math.sin(phi) * Math.sin(theta),
      y: this.target.y + distance * Math.cos(phi),
      z: this.target.z + distance * Math.sin(phi) * Math.cos(theta),
    };
  }

  // Zoom camera
  zoom(delta: number) {
    const direction = Vector3D.subtract(this.target, this.position).normalize();
    const distance = Vector3D.subtract(this.position, this.target);
    const currentDistance = Math.sqrt(distance.x * distance.x + distance.y * distance.y + distance.z * distance.z);
    
    const newDistance = Math.max(1, Math.min(50, currentDistance + delta));
    const ratio = newDistance / currentDistance;
    
    this.position = {
      x: this.target.x + distance.x * ratio,
      y: this.target.y + distance.y * ratio,
      z: this.target.z + distance.z * ratio,
    };
  }
}

// 3D Renderer
class Renderer3D {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  camera: Camera3D;
  width: number;
  height: number;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.camera = new Camera3D();
    this.width = width;
    this.height = height;
    
    canvas.width = width;
    canvas.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Render grid
  renderGrid(size: number = 10, divisions: number = 10) {
    this.ctx.strokeStyle = 'var(--color-border)';
    this.ctx.lineWidth = 1;
    
    const step = size / divisions;
    
    for (let i = -divisions; i <= divisions; i++) {
      const pos = i * step;
      
      // X-Z plane grid
      const start1 = this.camera.project({ x: -size, y: 0, z: pos }, this.width, this.height);
      const end1 = this.camera.project({ x: size, y: 0, z: pos }, this.width, this.height);
      
      const start2 = this.camera.project({ x: pos, y: 0, z: -size }, this.width, this.height);
      const end2 = this.camera.project({ x: pos, y: 0, z: size }, this.width, this.height);
      
      this.ctx.beginPath();
      this.ctx.moveTo(start1.x, start1.y);
      this.ctx.lineTo(end1.x, end1.y);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(start2.x, start2.y);
      this.ctx.lineTo(end2.x, end2.y);
      this.ctx.stroke();
    }
  }

  // Render axes
  renderAxes(length: number = 5) {
    const origin = { x: 0, y: 0, z: 0 };
    const xAxis = { x: length, y: 0, z: 0 };
    const yAxis = { x: 0, y: length, z: 0 };
    const zAxis = { x: 0, y: 0, z: length };
    
    const originProj = this.camera.project(origin, this.width, this.height);
    const xProj = this.camera.project(xAxis, this.width, this.height);
    const yProj = this.camera.project(yAxis, this.width, this.height);
    const zProj = this.camera.project(zAxis, this.width, this.height);
    
    // X axis (red)
    this.ctx.strokeStyle = 'var(--color-red-500)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(originProj.x, originProj.y);
    this.ctx.lineTo(xProj.x, xProj.y);
    this.ctx.stroke();
    
    // Y axis (green)
    this.ctx.strokeStyle = 'var(--color-green-500)';
    this.ctx.beginPath();
    this.ctx.moveTo(originProj.x, originProj.y);
    this.ctx.lineTo(yProj.x, yProj.y);
    this.ctx.stroke();
    
    // Z axis (blue)
    this.ctx.strokeStyle = 'var(--color-blue-500)';
    this.ctx.beginPath();
    this.ctx.moveTo(originProj.x, originProj.y);
    this.ctx.lineTo(zProj.x, zProj.y);
    this.ctx.stroke();
  }

  // Render data nodes
  renderNodes(nodes: DataNode[]) {
    // Sort nodes by depth for proper rendering order
    const projectedNodes = nodes.map(node => ({
      ...node,
      projected: this.camera.project(node.position, this.width, this.height),
    })).sort((a, b) => b.projected.z - a.projected.z);

    // Render connections first
    projectedNodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = projectedNodes.find(n => n.id === connectionId);
        if (connectedNode) {
          this.ctx.strokeStyle = 'var(--color-muted-foreground)';
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(node.projected.x, node.projected.y);
          this.ctx.lineTo(connectedNode.projected.x, connectedNode.projected.y);
          this.ctx.stroke();
        }
      });
    });

    // Render nodes
    projectedNodes.forEach(node => {
      const { x, y, z } = node.projected;
      const size = (node.position.size || 5) * (10 / z); // Size based on depth
      
      // Node color based on type
      const colors = {
        metric: 'var(--color-blue-500)',
        category: 'var(--color-emerald-500)',
        trend: 'var(--color-amber-500)',
        outlier: 'var(--color-red-500)',
      };
      
      this.ctx.fillStyle = node.position.color || colors[node.type];
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Node border
      this.ctx.strokeStyle = 'var(--color-background)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Label
      if (node.position.label) {
        this.ctx.fillStyle = 'var(--color-foreground)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(node.position.label, x, y - size - 5);
      }
    });
  }

  // Render holographic effects
  renderHolographic(nodes: DataNode[]) {
    nodes.forEach(node => {
      const projected = this.camera.project(node.position, this.width, this.height);
      const { x, y } = projected;
      
      // Holographic glow
      const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20);
      gradient.addColorStop(0, 'var(--color-blue-500)');
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 20, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Scanning lines effect
      const time = Date.now() * 0.001;
      const scanY = y + Math.sin(time * 2 + x * 0.01) * 10;
      
      this.ctx.strokeStyle = 'var(--color-cyan-400)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x - 15, scanY);
      this.ctx.lineTo(x + 15, scanY);
      this.ctx.stroke();
    });
  }
}

export function Spatial3D({
  data,
  width = 800,
  height = 600,
  interactive = true,
  showGrid = true,
  showAxes = true,
  cameraPosition,
  className,
}: Spatial3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer3D | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new Renderer3D(canvasRef.current, width, height);
      
      if (cameraPosition) {
        rendererRef.current.camera.position = cameraPosition;
      }
    }
  }, [width, height, cameraPosition]);

  // Render loop
  const render = useCallback(() => {
    if (!rendererRef.current) return;
    
    const renderer = rendererRef.current;
    renderer.clear();
    
    if (showGrid) {
      renderer.renderGrid();
    }
    
    if (showAxes) {
      renderer.renderAxes();
    }
    
    renderer.renderNodes(data);
    renderer.renderHolographic(data);
  }, [data, showGrid, showAxes]);

  // Animation loop
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [render]);

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsInteracting(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [interactive]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive || !isInteracting || !rendererRef.current) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    rendererRef.current.camera.rotate(deltaX, deltaY);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [interactive, isInteracting, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!interactive || !rendererRef.current) return;
    
    e.preventDefault();
    const delta = e.deltaY * 0.01;
    rendererRef.current.camera.zoom(delta);
  }, [interactive]);

  return (
    <div className={cn('relative', className)}>
      <canvas
        ref={canvasRef}
        className="border border-border dark:border-border rounded-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Controls overlay */}
      {interactive && (
        <div className="absolute top-2 right-2 bg-background dark:bg-muted/90 rounded-lg p-sm shadow-floating text-xs text-muted-foreground/70 dark:text-muted-foreground/50">
          <div>Click + drag to rotate</div>
          <div>Scroll to zoom</div>
        </div>
      )}
    </div>
  );
}

// Specialized 3D visualizations
interface NetworkGraph3DProps {
  nodes: Array<{
    id: string;
    label: string;
    value: number;
    group: string;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
  }>;
  width?: number;
  height?: number;
}

export function NetworkGraph3D({ nodes, edges, width = 800, height = 600 }: NetworkGraph3DProps) {
  // Convert network data to 3D positions using force-directed layout
  const data3D: DataNode[] = nodes.map((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2;
    const radius = 3 + (node.value / 100) * 2;
    
    return {
      id: node.id,
      position: {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 2,
        z: Math.sin(angle) * radius,
        label: node.label,
        size: 3 + (node.value / 100) * 5,
        color: `var(--color-${['blue', 'green', 'purple', 'orange', 'pink', 'teal'][node.group.charCodeAt(0) % 6]}-500)`,
      },
      connections: edges.filter(e => e.source === node.id).map(e => e.target),
      data: node,
      type: 'metric' as const,
    };
  });

  return <Spatial3D data={data3D} width={width} height={height} />;
}

interface ScatterPlot3DProps {
  data: Array<{
    x: number;
    y: number;
    z: number;
    label?: string;
    category?: string;
    value?: number;
  }>;
  width?: number;
  height?: number;
}

export function ScatterPlot3D({ data, width = 800, height = 600 }: ScatterPlot3DProps) {
  const data3D: DataNode[] = data.map((point, index) => ({
    id: `point_${index}`,
    position: {
      x: point.x,
      y: point.y,
      z: point.z,
      label: point.label,
      size: point.value ? 2 + (point.value / 100) * 8 : 5,
      color: point.category 
        ? `hsl(${(point.category.charCodeAt(0) * 137.5) % 360}, 70%, 50%)`
        : '#3b82f6',
    },
    connections: [],
    data: point,
    type: 'metric' as const,
  }));

  return <Spatial3D data={data3D} width={width} height={height} showGrid={true} showAxes={true} />;
}

interface HierarchyTree3DProps {
  root: {
    id: string;
    label: string;
    children?: Array<{
      id: string;
      label: string;
      value?: number;
      children?: any[];
    }>;
  };
  width?: number;
  height?: number;
}

export function HierarchyTree3D({ root, width = 800, height = 600 }: HierarchyTree3DProps) {
  const data3D: DataNode[] = [];
  
  // Recursive function to position nodes in 3D space
  const positionNode = (node: any, level: number = 0, angle: number = 0, parentPos?: Point3D) => {
    const radius = level * 2;
    const y = -level * 1.5;
    
    const position: Point3D = {
      x: Math.cos(angle) * radius,
      y,
      z: Math.sin(angle) * radius,
      label: node.label,
      size: node.value ? 3 + (node.value / 100) * 5 : 5,
    };

    const connections: string[] = [];
    if (parentPos) {
      // Find parent node ID (would need to track this properly)
      connections.push('parent'); // Simplified for example
    }

    data3D.push({
      id: node.id,
      position,
      connections,
      data: node,
      type: level === 0 ? 'category' : 'metric',
    });

    // Position children
    if (node.children) {
      const angleStep = (Math.PI * 2) / node.children.length;
      node.children.forEach((child: any, index: number) => {
        const childAngle = angle + (index - node.children.length / 2) * angleStep;
        positionNode(child, level + 1, childAngle, position);
      });
    }
  };

  positionNode(root);

  return <Spatial3D data={data3D} width={width} height={height} />;
}
