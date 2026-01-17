import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';

export default memo(({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl min-w-[250px] shadow-sm hover:border-amber-400 transition-colors">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100 rounded-t-xl">
        <MessageSquare size={18} className="text-amber-500" />
        <span className="text-sm font-semibold text-slate-800">User Query</span>
      </div>
      
      <div className="p-4 bg-white rounded-b-xl relative">
        <div className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1.5 rounded mb-2">
          Entry point for user input
        </div>
        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white" />
      </div>
    </div>
  );
});
