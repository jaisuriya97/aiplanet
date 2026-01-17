import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function MyStacks() {
  const navigate = useNavigate();
  
  const stacks = [
    {
      id: 1,
      name: 'Chat With AI',
      description: 'Chat with a smart AI',
      icon: '💬'
    },
    {
      id: 2,
      name: 'Content Writer',
      description: 'Helps you write content',
      icon: '✍️'
    },
    {
      id: 3,
      name: 'Content Summarizer',
      description: 'Helps you summarize content',
      icon: '📝'
    },
    {
      id: 4,
      name: 'Information Finder',
      description: 'Helps you find relevant information',
      icon: '🔍'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">My Stacks</h1>
            <p className="text-gray-600 mt-2">Build AI-powered workflows visually</p>
          </div>
          <button
            onClick={() => navigate('/editor/new')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            <Plus size={20} />
            New Stack
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {stacks.map((stack) => (
            <div
              key={stack.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              onClick={() => navigate(`/editor/${stack.id}`)}
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{stack.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{stack.name}</h3>
                <p className="text-gray-600 text-sm">{stack.description}</p>
              </div>
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 group-hover:bg-indigo-50 transition-colors">
                <button className="text-indigo-600 text-sm font-medium">
                  Edit Stack →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
