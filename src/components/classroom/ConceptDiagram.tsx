'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Hand, Eye, Settings, Zap, BookOpen, Heart, Activity, 
  Cpu, Database, Network, Shield, Cloud, Code2, Layers, Key,
  Workflow, Share2, HelpCircle
} from 'lucide-react';

interface DiagramNode {
  label: string;
  icon?: string;
}

interface DiagramData {
  root: DiagramNode;
  children: DiagramNode[];
}

interface ConceptDiagramProps {
  dataString: string;
  theme: 'cyber' | 'chalk' | 'studio' | 'terminal';
}

export const ConceptDiagram: React.FC<ConceptDiagramProps> = ({ dataString, theme }) => {
  // Parsing logic with streaming fallback
  const parseData = (raw: string): DiagramData => {
    try {
      // Clean up string in case of markdown wrap or trailing text
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/```json|```/g, '').trim();
      else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.root) {
        return parsed as DiagramData;
      }
    } catch (e) {
      // Fallback parser if JSON is incomplete or malformed (streaming)
      // Extract keywords or build mock tree from text
      const cleanString = raw.replace(/[{}"'[\]]/g, '');
      const parts = cleanString.split(/children|labels/i);
      const rootLabel = parts[0]?.replace(/root|label|:/gi, '').trim() || 'Core Concept';
      
      const childrenParts = parts[1]?.split(',') || [];
      const children = childrenParts
        .map(p => p.replace(/label|:/gi, '').trim())
        .filter(Boolean)
        .map(l => ({ label: l }));
        
      if (children.length > 0) {
        return {
          root: { label: rootLabel },
          children: children.slice(0, 4)
        };
      }
    }

    // Default structure matching user image sample
    return {
      root: { label: 'System Core' },
      children: [
        { label: 'Input Module' },
        { label: 'Visual Interface' }
      ]
    };
  };

  const diagram = parseData(dataString);

  // Icon mapping
  const getLucideIcon = (name: string, isRoot: boolean) => {
    const lower = name.toLowerCase();
    
    // Choose appropriate color schemes
    const rootColor = theme === 'chalk' ? 'text-cyan-300' : 'text-blue-400';
    const childColor = theme === 'chalk' ? 'text-yellow-300' : 'text-amber-400';
    const activeColor = isRoot ? rootColor : childColor;

    if (lower.includes('brain') || lower.includes('mind') || lower.includes('think') || lower.includes('system') || lower.includes('isolation')) {
      return <Brain className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('hand') || lower.includes('touch') || lower.includes('click') || lower.includes('interoperability') || lower.includes('control')) {
      return <Hand className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('eye') || lower.includes('look') || lower.includes('see') || lower.includes('visual') || lower.includes('discoverability') || lower.includes('view')) {
      return <Eye className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('code') || lower.includes('program') || lower.includes('logic')) {
      return <Code2 className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('data') || lower.includes('storage') || lower.includes('database')) {
      return <Database className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('server') || lower.includes('network') || lower.includes('link')) {
      return <Network className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('scalability') || lower.includes('scale') || lower.includes('layer') || lower.includes('grow')) {
      return <Layers className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('security') || lower.includes('shield') || lower.includes('protect')) {
      return <Shield className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('speed') || lower.includes('zap') || lower.includes('fast')) {
      return <Zap className={`h-10 w-10 ${activeColor}`} />;
    }
    if (lower.includes('flow') || lower.includes('process') || lower.includes('work')) {
      return <Workflow className={`h-10 w-10 ${activeColor}`} />;
    }

    // Default icon selection based on root/child role
    return isRoot 
      ? <Cpu className={`h-10 w-10 ${activeColor}`} /> 
      : <Share2 className={`h-10 w-10 ${activeColor}`} />;
  };

  // Node container styles
  const getNodeClass = (isRoot: boolean) => {
    if (theme === 'chalk') {
      return isRoot 
        ? 'border-2 border-cyan-400/30 bg-transparent text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
        : 'border border-dashed border-yellow-200/30 bg-transparent text-yellow-100';
    }
    if (theme === 'studio') {
      return isRoot
        ? 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900 shadow-md'
        : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-sm';
    }
    if (theme === 'terminal') {
      return 'border border-[#33ff33] bg-black text-[#33ff33] font-mono';
    }
    // Cyber / Default
    return isRoot
      ? 'bg-blue-500/10 border-2 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
      : 'bg-slate-900/60 border border-white/5 text-slate-200';
  };

  const getLineColor = () => {
    if (theme === 'chalk') return 'rgba(255, 255, 255, 0.25)';
    if (theme === 'studio') return 'rgba(99, 102, 241, 0.35)';
    if (theme === 'terminal') return '#33ff33';
    return 'rgba(99, 102, 241, 0.4)';
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full max-w-lg mx-auto">
      {/* Root Node */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`flex flex-col items-center p-4 rounded-2xl w-36 transition-all duration-300 ${getNodeClass(true)}`}
      >
        <div className="mb-2 p-2 rounded-xl bg-white/5 flex items-center justify-center">
          {getLucideIcon(diagram.root.label, true)}
        </div>
        <span className="text-sm font-bold tracking-wide uppercase text-center truncate max-w-full">
          {diagram.root.label}
        </span>
      </motion.div>

      {/* Connection Arrows & Lines */}
      {diagram.children.length > 0 && (
        <div className="w-full h-16 relative">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={getLineColor()} />
              </marker>
            </defs>
            {/* Draw hierarchical line branches tree */}
            {/* Horizontal connection line spanning all children */}
            <path
              d={`M ${100 / (diagram.children.length + 1)} 15 L ${100 - (100 / (diagram.children.length + 1))}% 15`}
              stroke={getLineColor()}
              strokeWidth="2"
              fill="none"
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
            {/* Vertical trunk line from Root to horizontal span */}
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="15"
              stroke={getLineColor()}
              strokeWidth="2"
            />
            {/* Vertical drop down lines with arrowheads pointing to each child */}
            {diagram.children.map((_, i) => {
              const xPos = `${((i + 1) * 100) / (diagram.children.length + 1)}%`;
              return (
                <line
                  key={i}
                  x1={xPos}
                  y1="15"
                  x2={xPos}
                  y2="55"
                  stroke={getLineColor()}
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            })}
          </svg>
        </div>
      )}

      {/* Children Nodes Row */}
      <div className="flex justify-around items-start w-full gap-4">
        {diagram.children.map((child, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15 + 0.2 }}
            className={`flex flex-col items-center p-3.5 rounded-2xl w-28 text-center transition-all duration-300 ${getNodeClass(false)}`}
          >
            <div className="mb-2 p-2 rounded-xl bg-white/5 flex items-center justify-center">
              {getLucideIcon(child.label, false)}
            </div>
            <span className="text-[11px] font-semibold tracking-normal leading-tight max-w-full whitespace-normal">
              {child.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
