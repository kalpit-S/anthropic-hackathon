import React from "react";

const NodeCardView = ({ node, onFollowUpClick }) => {
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
