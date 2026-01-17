import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './Sidebar';
import UserQueryNode from './nodes/UserQueryNode';
import KnowledgeBaseNode from './nodes/KnowledgeBaseNode';
import LLMEngineNode from './nodes/LLMEngineNode';
import OutputNode from './nodes/OutputNode';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, MessageSquare } from 'lucide-react';
import Chat from './Chat';
import { toast } from 'react-toastify';

const initialNodes = [];
const id = () => `dndnode_${+new Date()}`;

const WorkflowBuilder = () => {
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [isChatOpen, setChatOpen] = useState(false);

    const nodeTypes = useMemo(() => ({ 
        userQuery: UserQueryNode,
        knowledgeBase: KnowledgeBaseNode,
        llmEngine: LLMEngineNode,
        output: OutputNode
    }), []);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData('application/reactflow');

        if (typeof type === 'undefined' || !type) {
            return;
        }

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });
        const newNode = {
            id: id(),
            type,
            position,
            data: { label: `${type} node` },
        };

        setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <span className="font-semibold text-slate-800 text-sm">Workflow Builder</span>
            </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
            <ReactFlowProvider>
                <Sidebar />
                <div className="flex-1 h-full w-full relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                    <Controls />
                    <Background color="#cbd5e1" gap={16} size={1} />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>

            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-50">
                 <button 
                    className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg font-semibold text-sm transition-all"
                    onClick={() => {
                         if (nodes.length < 2 || edges.length === 0) {
                            toast.warning('Please create a valid workflow (at least 2 connected nodes).');
                            return;
                        }
                        toast.success('Workflow validated! Opening chat...');
                        setChatOpen(true);
                    }}
                 >
                    <Play size={18} fill="white" />
                    Build Stack
                 </button>
            </div>
        </div>

        {isChatOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white w-[400px] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-white">
                        <h3 className="font-semibold text-slate-800">Chat with Stack</h3>
                        <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-slate-600">
                             <span className="text-2xl leading-none">&times;</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Chat workflow={{ nodes, edges }} />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default WorkflowBuilder;
