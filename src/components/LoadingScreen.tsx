import React from 'react';
import { motion } from 'motion/react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1.5, 2, 3, 5, 10, 20],
          opacity: [1, 1, 1, 1, 1, 1, 0.5, 0]
        }}
        transition={{
          duration: 2,
          times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1],
          ease: "easeIn"
        }}
        className="w-16 h-16 bg-blue-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.8)]"
      />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-20 text-white font-black text-xl tracking-widest"
      >
        Loading Box... / 正在装箱...
      </motion.div>
    </div>
  );
};
