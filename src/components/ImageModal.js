import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

export default ImageModal;
