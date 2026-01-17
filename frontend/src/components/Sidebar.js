import React from 'react';
import { MessageSquare, Database, Cpu, FileOutput } from 'lucide-react';

const components = [
  { type: 'userQuery', label: 'User Query', icon: MessageSquare, color: 'text-amber-600' },
  { type: 'knowledgeBase', label: 'Knowledge Base', icon: Database, color: 'text-emerald-600' },
  { type: 'llmEngine', label: 'LLM Engine', icon: Cpu, color: 'text-blue-600' },
  { type: 'output', label: 'Output', icon: FileOutput, color: 'text-purple-600' }
];

export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Components</h3>
      <div className="space-y-2">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => onDragStart(e, component.type)}
              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              <Icon className={`${component.color} flex-shrink-0`} size={20} />
              <span className="text-sm font-medium text-gray-700">{component.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
