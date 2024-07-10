import React from "react";

const NodeView = ({ nodes, selectedNode, onNodeClick }) => {
  return (
    <div className="flex space-x-2 mb-4 overflow-x-auto">
      {nodes.map((node) => (
        <button
          key={node.id}
          onClick={() => onNodeClick(node)}
          className={`px-3 py-1 rounded whitespace-nowrap ${
            selectedNode && selectedNode.id === node.id
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {node.title}
        </button>
      ))}
    </div>
  );
};

export default NodeView;
