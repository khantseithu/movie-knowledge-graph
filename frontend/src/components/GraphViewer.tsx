import { useRef, useEffect, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";
import type { GraphData, GraphNode } from "../api/client";

interface GraphViewerProps {
  data: GraphData;
  onNodeClick?: (node: any) => void;
  width?: number;
  height?: number;
}

const COLORS = {
  Movie: "#60a5fa", // Blue
  Person: "#fbbf24", // Amber
  Genre: "#34d399", // Green
  Default: "#a78bfa", // Purple
};

const GraphViewer = ({ data, onNodeClick, width, height }: GraphViewerProps) => {
  const fgRef = useRef<ForceGraphMethods>();

  // Center the graph when data changes
  useEffect(() => {
    if (fgRef.current && data.nodes.length > 0) {
      fgRef.current.zoomToFit(400, 100);
    }
  }, [data]);

  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 14 / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.5); // some padding

    const color = COLORS[node.label as keyof typeof COLORS] || COLORS.Default;

    // Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Node Border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth = 1 / globalScale;
    ctx.stroke();

    // Node Shadow/Glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    // Text Label
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.shadowBlur = 0; // Don't glow the text
    ctx.fillText(label, node.x, node.y + 12);
  }, []);

  return (
    <div className="graph-container">
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={width}
        height={height}
        nodeLabel={(node: any) => `${node.label}: ${node.name}`}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "before"}
        linkColor={() => "rgba(255, 255, 255, 0.1)"}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.1}
        onNodeClick={onNodeClick}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};

export default GraphViewer;
