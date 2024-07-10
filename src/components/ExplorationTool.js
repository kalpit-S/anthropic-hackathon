import React, { useState } from "react";
import { fetchImageUrl, callLanguageModel } from "../utils/api";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Book,
  Calculator,
  Zap,
} from "lucide-react";
import NodeView from "./NodeView";
import NodeCardView from "./NodeCardView";

const ExplorationTool = () => {
  const [query, setQuery] = useState("");
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

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
        setHistory([...history, newNode.id]);
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
    setHistory([...history, node.id]);
  };

  const handleFollowUpClick = async (question) => {
    await handleQuery(question);
  };

  const handleNavigation = (direction) => {
    const currentIndex = history.indexOf(selectedNode.id);
    if (direction === "back" && currentIndex > 0) {
      const prevNodeId = history[currentIndex - 1];
      setSelectedNode(nodes.find((node) => node.id === prevNodeId));
    } else if (direction === "forward" && currentIndex < history.length - 1) {
      const nextNodeId = history[currentIndex + 1];
      setSelectedNode(nodes.find((node) => node.id === nextNodeId));
    }
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
          <div className="flex justify-between mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation("back")}
              disabled={!selectedNode || history.indexOf(selectedNode.id) === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="mr-2" /> Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation("forward")}
              disabled={
                !selectedNode ||
                history.indexOf(selectedNode.id) === history.length - 1
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forward <ChevronRight className="ml-2" />
            </motion.button>
          </div>

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
                  <img
                    src={selectedNode.imageUrl}
                    alt={selectedNode.title}
                    className="mt-4 rounded-lg shadow-md max-w-full h-auto"
                  />
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
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
              {nodes.map((node) => (
                <motion.button
                  key={node.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleNodeClick(node)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap ${
                    selectedNode && selectedNode.id === node.id
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {node.title}
                </motion.button>
              ))}
            </div>
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
    </div>
  );
};

export default ExplorationTool;
