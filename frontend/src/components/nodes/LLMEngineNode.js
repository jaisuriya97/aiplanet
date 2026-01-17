import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Cpu } from 'lucide-react';

export default memo(({ id, data }) => {
  const { setNodes } = useReactFlow();

  const onChange = useCallback((evt) => {
    const { name, value } = evt.target;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          node.data = { ...node.data, [name]: value };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl min-w-[300px] shadow-sm hover:border-blue-400 transition-colors">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100 rounded-t-xl">
        <Cpu size={18} className="text-blue-500" />
        <span className="text-sm font-semibold text-slate-800">LLM Engine</span>
      </div>
      
      <div className="p-4 flex flex-col gap-4 bg-white relative rounded-b-xl">
        <div className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1.5 rounded mb-1">
          Generate AI responses
        </div>
        
        <div className="relative flex items-center justify-start mb-1">
            <Handle type="target" position={Position.Left} id="query" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" style={{ left: '-21px' }} />
            <span className="text-xs font-medium text-slate-500 ml-2">Input</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">LLM Provider</label>
          <select name="llm_provider" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white outline-none focus:border-blue-500 transition-all nodrag" defaultValue={data.llm_provider} onChange={onChange}>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">Model</label>
          <select name="model" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white outline-none focus:border-blue-500 transition-all nodrag" defaultValue={data.model} onChange={onChange}>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600">Custom Prompt (Optional)</label>
          <textarea 
            name="custom_prompt" 
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white outline-none focus:border-blue-500 transition-all nodrag resize-none" 
            rows="3"
            placeholder="Add custom instructions..."
            defaultValue={data.custom_prompt}
            onChange={onChange}
          />
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            name="use_serpapi" 
            id={`serpapi-${id}`}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            defaultChecked={data.use_serpapi}
            onChange={(e) => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === id) {
                    node.data = { ...node.data, use_serpapi: e.target.checked };
                  }
                  return node;
                })
              );
            }}
          />
          <label htmlFor={`serpapi-${id}`} className="text-xs font-medium text-slate-600 cursor-pointer">
            Use Web Search (SerpAPI)
          </label>
        </div>

        <div className="relative flex items-center justify-end pt-1">
            <span className="text-xs font-medium text-slate-500 mr-2">Response</span>
            <Handle type="source" position={Position.Right} id="response" className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white" style={{ right: '-21px' }} />
        </div>
      </div>
    </div>
  );
});
