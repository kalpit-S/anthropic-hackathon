import React, { useEffect } from "react";
import mermaid from "mermaid";

const NodeCardView = ({ node, onFollowUpClick }) => {
  useEffect(() => {
    if (node.mermaidCode) {
      mermaid.initialize({ startOnLoad: true });
      mermaid.run();
    }
  }, [node.mermaidCode]);

  if (!node) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
      <h2 className="text-2xl font-bold mb-4">{node.title}</h2>
      <div
        className="mb-4"
        dangerouslySetInnerHTML={{ __html: node.content }}
      />
      {node.imageUrl && (
        <img
          src={node.imageUrl}
          alt={node.title}
          className="mb-4 max-w-full h-auto"
        />
      )}
      {node.mermaidCode && (
        <div className="mermaid mb-4">{node.mermaidCode}</div>
      )}
      <h3 className="text-xl font-semibold mb-2">Follow-up Questions:</h3>
      <ul className="list-disc pl-5">
        {node.followUpQuestions &&
          node.followUpQuestions.map((question, index) => (
            <li key={index} className="mb-1">
              <button
                onClick={() => onFollowUpClick(question)}
                className="text-blue-500 hover:underline"
              >
                {question}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default NodeCardView;
