
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  finishLoading: () => void;
}

const LoadingScreen = ({ finishLoading }: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (you can replace this with actual loading logic)
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(finishLoading, 1000); // Delay to allow the exit animation to complete
    }, 2500);

    return () => clearTimeout(timer);
  }, [finishLoading]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                transition: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
              className="mb-8"
            >
              <Logo size="large" />
            </motion.div>
            <motion.div 
              className="w-40 h-1 bg-gray-800 rounded-full overflow-hidden"
            >
              <motion.div 
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ 
                  width: "100%",
                  transition: { duration: 2.2, ease: "easeInOut" }
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
