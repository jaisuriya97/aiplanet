import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileOutput } from 'lucide-react';

export default memo(({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl min-w-[250px] shadow-sm hover:border-purple-400 transition-colors">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100 rounded-t-xl">
        <FileOutput size={18} className="text-purple-500" />
        <span className="text-sm font-semibold text-slate-800">Output</span>
      </div>
      
      <div className="p-4 bg-white rounded-b-xl relative">
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
        <div className="bg-purple-50 text-purple-700 text-xs px-2.5 py-1.5 rounded">
          Displays final response
        </div>
      </div>
    </div>
  );
});
