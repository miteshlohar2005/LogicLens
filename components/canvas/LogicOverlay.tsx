"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerationStore, type LogicGraph, type LogicEdge } from "@/store/generationStore";

interface Point { x: number; y: number; }

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function edgeColor(confidence: number): string {
  if (confidence >= 0.8) return "#6c63ff";
  if (confidence >= 0.5) return "#00d4ff";
  return "#ff6bcb";
}

interface EdgePathProps {
  edge: LogicEdge;
  graph: LogicGraph;
}

function EdgePath({ edge, graph }: EdgePathProps) {
  const source = graph.nodes.find((n) => n.id === edge.sourceId);
  const target = graph.nodes.find((n) => n.id === edge.targetId);
  if (!source || !target) return null;

  const sx = source.boundingBox.x + source.boundingBox.w / 2;
  const sy = source.boundingBox.y + source.boundingBox.h / 2;
  const tx = target.boundingBox.x + target.boundingBox.w / 2;
  const ty = target.boundingBox.y + target.boundingBox.h / 2;
  const mid = midpoint({ x: sx, y: sy }, { x: tx, y: ty });

  const color = edgeColor(edge.confidence);
  const pathD = `M ${sx} ${sy} Q ${mid.x} ${mid.y - 30} ${tx} ${ty}`;

  return (
    <g>
      {/* Glow layer */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeOpacity={0.15}
        strokeLinecap="round"
      />
      {/* Main line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.85}
        strokeLinecap="round"
        strokeDasharray="6 4"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      {/* Arrowhead */}
      <motion.circle
        cx={tx}
        cy={ty}
        r={4}
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.2 }}
      />
      {/* Annotation label */}
      {edge.annotation && (
        <motion.text
          x={mid.x}
          y={mid.y - 38}
          textAnchor="middle"
          fill={color}
          fontSize={9}
          fontFamily="var(--font-jetbrains-mono), monospace"
          opacity={0.8}
          initial={{ opacity: 0, y: mid.y - 28 }}
          animate={{ opacity: 0.8, y: mid.y - 38 }}
          transition={{ delay: 0.9, duration: 0.3 }}
        >
          {edge.annotation.length > 28 ? edge.annotation.slice(0, 28) + "…" : edge.annotation}
        </motion.text>
      )}
    </g>
  );
}

interface NodeHighlightProps {
  node: LogicGraph["nodes"][number];
  index: number;
}

function NodeHighlight({ node, index }: NodeHighlightProps) {
  const { x, y, w, h } = node.boundingBox;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <rect
        x={x - 2} y={y - 2} width={w + 4} height={h + 4}
        rx={6} ry={6}
        fill="none"
        stroke="rgba(108,99,255,0.5)"
        strokeWidth={1.5}
        strokeDasharray="5 3"
      />
      <text
        x={x + 4} y={y - 6}
        fill="rgba(167,139,250,0.8)"
        fontSize={8}
        fontFamily="var(--font-jetbrains-mono), monospace"
      >
        {node.inferredComponent}
      </text>
    </motion.g>
  );
}

export default function LogicOverlay() {
  const logicGraph = useGenerationStore((s) => s.logicGraph);
  const status = useGenerationStore((s) => s.status);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVisible = !!logicGraph && (
    status === "parse-done" || status === "generating" || status === "done" || status === "refining"
  );

  return (
    <AnimatePresence>
      {isVisible && logicGraph && (
        <motion.div
          ref={containerRef}
          key="logic-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 pointer-events-none z-10"
        >
          <svg className="w-full h-full overflow-visible">
            {/* Node highlights */}
            {logicGraph.nodes.map((node, i) => (
              <NodeHighlight key={node.id} node={node} index={i} />
            ))}
            {/* Edge paths */}
            {logicGraph.edges.map((edge) => (
              <EdgePath key={edge.id} edge={edge} graph={logicGraph} />
            ))}
          </svg>

          {/* Global intent chip */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 badge badge-brand text-xs px-3 py-1"
          >
            <span className="dot-live" style={{ width: 6, height: 6 }} />
            {logicGraph.globalIntent}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
