import React, { useState, useEffect } from "react";
import { fetchImageUrl, callLanguageModel } from "../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Book, Calculator, Zap, Maximize2, X } from "lucide-react";
import mermaid from "mermaid";

const ExplorationTool = () => {
  const [query, setQuery] = useState("");
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = nodes.findIndex(
          (node) => node.id === selectedNode?.id
        );
        let newIndex;
        if (e.key === "ArrowLeft") {
          newIndex = Math.max(0, currentIndex - 1);
        } else {
          newIndex = Math.min(nodes.length - 1, currentIndex + 1);
        }
        setSelectedNode(nodes[newIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedNode]);

  const handleQuery = async (currentQuery) => {
    setLoading(true);
    setError(null);

    try {
      const context = {
        previous_nodes_titles: nodes.map((node) => node.title).join(", "),
        previous_node_content: selectedNode ? selectedNode.content : "",
        initial_query: nodes.length > 0 ? nodes[0].title : currentQuery,
      };
      const response = await callLanguageModel(currentQuery, context);

      if (response) {
        const imageUrl = await fetchImageUrl(
          response.image_queries[0] || currentQuery
        );
        const newNode = {
          id: nodes.length + 1,
          title: currentQuery,
          content: response.html_content,
          followUpQuestions: response.follow_up_questions,
          imageUrl,
        };

        setNodes([...nodes, newNode]);
        setSelectedNode(newNode);
      }
    } catch (err) {
      setError(
        "An error occurred while processing your request. Please try again."
      );
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      await handleQuery(query);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleFollowUpClick = async (question) => {
    await handleQuery(question);
  };

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
  };

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
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {node.title}
          </button>
        ))}
      </div>
    );
  };

  const ImageModal = ({ imageUrl, alt, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-lg overflow-hidden max-w-[90vw] max-h-[90vh] w-auto h-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 transition-all"
            >
              <X size={24} />
            </button>
            <img
              src={imageUrl}
              alt={alt}
              className="w-auto h-auto max-w-full max-h-[calc(90vh-4rem)] object-contain"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <header className="bg-blue-600 text-white p-6">
          <h1 className="text-3xl font-bold">Exploration Tool</h1>
          <p className="mt-2 text-blue-100">
            Discover and learn through interactive exploration
          </p>
        </header>

        <main className="p-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            >
              {error}
            </motion.div>
          )}

          <motion.div layout className="bg-white rounded-lg shadow-md p-6 mb-6">
            {selectedNode ? (
              <>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Book className="mr-2" /> {selectedNode.title}
                </h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedNode.content }}
                />
                {selectedNode.imageUrl && (
                  <div className="relative mt-4 inline-block">
                    <img
                      src={selectedNode.imageUrl}
                      alt={selectedNode.title}
                      className="rounded-lg shadow-md max-w-full h-auto cursor-pointer transition-all hover:opacity-90"
                      onClick={() => handleImageClick(selectedNode.imageUrl)}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full">
                      <Maximize2 size={16} />
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-semibold mt-6 mb-3 flex items-center">
                  <Zap className="mr-2" /> Follow-up Questions:
                </h3>
                <ul className="space-y-2">
                  {selectedNode.followUpQuestions.map((question, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        onClick={() => handleFollowUpClick(question)}
                        className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                      >
                        {question}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-600 italic">
                Select a node or enter a query to start exploring.
              </p>
            )}
          </motion.div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <NodeView
              nodes={nodes}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
            />
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your query..."
                className="flex-grow px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Calculator className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Submit
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </main>
      </motion.div>
      <ImageModal
        imageUrl={modalImage}
        alt="Enlarged view"
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
      />
    </div>
  );
};

export default ExplorationTool;
