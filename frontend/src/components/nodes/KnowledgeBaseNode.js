import React, { memo, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { Database, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

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
       <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 rounded-t-xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
             <Database size={18} className="text-emerald-500" />
            Knowledge Base
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4 bg-white relative rounded-b-xl">
        <div className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1.5 rounded mb-1">
            Let LLM search info in your file
        </div>
        
        <div className="relative flex items-center justify-start mb-1">
            <Handle type="target" position={Position.Left} id="query" className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" style={{ left: '-21px' }} />
            <span className="text-xs font-medium text-slate-500 ml-2">Query</span>
        </div>

        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">File for Knowledge Base</label>
            <div 
                className="border border-emerald-500 text-emerald-600 rounded-md p-3 flex items-center justify-center gap-2 cursor-pointer bg-white hover:bg-emerald-50 transition-colors"
                onClick={() => document.getElementById(`file-upload-${id}`).click()}
            >
                <Upload size={16} />
                <span className="text-xs font-medium">Upload File</span>
            </div>
            <input 
                id={`file-upload-${id}`}
                type="file" 
                className="hidden" 
                accept=".pdf"
                onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (!file.name.endsWith('.pdf')) {
                        toast.error('Please upload a PDF file');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('files', file);

                    const uploadToast = toast.loading('Uploading file...');

                    try {
                        const response = await fetch('http://127.0.0.1:8000/api/knowledge_base/upload', {
                            method: 'POST',
                            body: formData,
                        });
                        
                        if (response.ok) {
                            toast.update(uploadToast, {
                                render: 'File uploaded successfully!',
                                type: 'success',
                                isLoading: false,
                                autoClose: 3000
                            });
                            setNodes((nds) =>
                                nds.map((node) => {
                                    if (node.id === id) {
                                        node.data = { ...node.data, fileName: file.name };
                                    }
                                    return node;
                                })
                            );
                        } else {
                            const error = await response.json();
                            toast.update(uploadToast, {
                                render: `Upload failed: ${error.detail || 'Unknown error'}`,
                                type: 'error',
                                isLoading: false,
                                autoClose: 5000
                            });
                        }
                    } catch (err) {
                        console.error(err);
                        toast.update(uploadToast, {
                            render: 'Error uploading file. Please check if backend is running.',
                            type: 'error',
                            isLoading: false,
                            autoClose: 5000
                        });
                    }
                }}
            />
            {data.fileName && (
                <div className="text-xs text-slate-600 mt-1">
                    📄 {data.fileName}
                </div>
            )}
        </div>

        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Embedding Model</label>
            <select name="embeddingModel" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 bg-white outline-none focus:border-blue-500 transition-all nodrag" defaultValue={data.embeddingModel} onChange={onChange}>
                <option value="text-embedding-3-large">text-embedding-3-large</option>
                <option value="text-embedding-3-small">text-embedding-3-small</option>
            </select>
        </div>

        <div className="relative flex items-center justify-end pt-1">
            <span className="text-xs font-medium text-slate-500 mr-2">Context</span>
            <Handle type="source" position={Position.Right} id="context" className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" style={{ right: '-21px' }} />
        </div>
      </div>
    </div>
  );
});
