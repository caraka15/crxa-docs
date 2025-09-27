import { useEffect, useState } from 'react';

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: string[];
}

export const NetworkBackground = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    // Generate initial nodes
    const initialNodes: Node[] = Array.from({ length: 18 }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 4 + 2,
      connections: []
    }));

    // Create connections between nearby nodes
    initialNodes.forEach((node, i) => {
      initialNodes.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 250 && node.connections.length < 3) {
            node.connections.push(otherNode.id);
          }
        }
      });
    });

    setNodes(initialNodes);
  }, [dimensions]);

  useEffect(() => {
    if (nodes.length === 0) return;

    const animateNodes = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => {
          let newX = node.x + node.vx;
          let newY = node.y + node.vy;
          let newVx = node.vx;
          let newVy = node.vy;

          // Bounce off walls
          if (newX <= 0 || newX >= dimensions.width) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(dimensions.width, newX));
          }
          if (newY <= 0 || newY >= dimensions.height) {
            newVy = -newVy;  
            newY = Math.max(0, Math.min(dimensions.height, newY));
          }

          return {
            ...node,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        })
      );
    };

    const interval = setInterval(animateNodes, 50);
    return () => clearInterval(interval);
  }, [nodes.length, dimensions]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg 
        width={dimensions.width} 
        height={dimensions.height}
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="nodeGradient1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(220 100% 60%)" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(220 100% 40%)" stopOpacity={0.3} />
          </radialGradient>
          <radialGradient id="nodeGradient2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(280 100% 60%)" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(280 100% 40%)" stopOpacity={0.3} />
          </radialGradient>
          <radialGradient id="nodeGradient3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(180 100% 60%)" stopOpacity={1} />
            <stop offset="100%" stopColor="hsl(180 100% 40%)" stopOpacity={0.3} />
          </radialGradient>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(220 100% 50%)" stopOpacity={0.2} />
            <stop offset="50%" stopColor="hsl(250 100% 50%)" stopOpacity={0.6} />
            <stop offset="100%" stopColor="hsl(280 100% 50%)" stopOpacity={0.2} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Render connections */}
        {nodes.map(node => 
          node.connections.map(connectionId => {
            const connectedNode = nodes.find(n => n.id === connectionId);
            if (!connectedNode) return null;
            
            return (
              <line
                key={`${node.id}-${connectionId}`}
                x1={node.x}
                y1={node.y}
                x2={connectedNode.x}
                y2={connectedNode.y}
                stroke="url(#connectionGradient)"
                strokeWidth={1}
                className="animate-pulse"
                style={{
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            );
          })
        )}
        
        {/* Render nodes */}
        {nodes.map((node, index) => {
          const gradientId = `nodeGradient${(index % 3) + 1}`;
          return (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={`url(#${gradientId})`}
              filter="url(#glow)"
              className="animate-pulse"
              style={{
                animationDuration: `${1.5 + Math.random() * 2}s`,
                animationDelay: `${Math.random() * 1}s`
              }}
            />
          );
        })}
        
        {/* Enhanced data flow particles */}
        {nodes.map((node, nodeIndex) => 
          node.connections.map((connectionId, connIndex) => {
            const connectedNode = nodes.find(n => n.id === connectionId);
            if (!connectedNode) return null;
            
            const colors = [
              'hsl(60 100% 60%)',   // Yellow
              'hsl(120 100% 60%)',  // Green  
              'hsl(300 100% 60%)',  // Magenta
              'hsl(200 100% 60%)',  // Cyan
            ];
            
            return (
              <circle
                key={`particle-${node.id}-${connectionId}-${connIndex}`}
                r={2}
                fill={colors[(nodeIndex + connIndex) % colors.length]}
                filter="url(#glow)"
                className="opacity-80"
              >
                <animateMotion
                  dur={`${2 + Math.random() * 3}s`}
                  repeatCount="indefinite"
                  begin={`${Math.random() * 2}s`}
                >
                  <mpath>
                    <path d={`M ${node.x} ${node.y} L ${connectedNode.x} ${connectedNode.y}`} />
                  </mpath>
                </animateMotion>
              </circle>
            );
          })
        )}
      </svg>
    </div>
  );
};