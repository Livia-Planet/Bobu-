import React from 'react';
import { motion } from 'motion/react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 2, 3, 4, 4.5, 6],
          opacity: [1, 1, 1, 1, 1, 0]
        }}
        transition={{
          duration: 1.8,
          times: [0, 0.4, 0.7, 0.9, 0.95, 1],
          ease: "easeIn"
        }}
        className="relative w-16 h-16 bg-blue-500 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.8)] flex items-center justify-center"
      >
        {/* Left Eye */}
        <motion.div
          animate={{
            scaleY: [1, 0.8, 0.4, 0.1, 0],
            x: [0, -2, -4, -6, -8]
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.4, 0.7, 0.9, 1],
            ease: "easeIn"
          }}
          className="absolute w-2 h-3 bg-slate-900 rounded-full"
          style={{ left: '30%', top: '35%' }}
        />
        {/* Right Eye */}
        <motion.div
          animate={{
            scaleY: [1, 0.8, 0.4, 0.1, 0],
            x: [0, 2, 4, 6, 8]
          }}
          transition={{
            duration: 1.8,
            times: [0, 0.4, 0.7, 0.9, 1],
            ease: "easeIn"
          }}
          className="absolute w-2 h-3 bg-slate-900 rounded-full"
          style={{ right: '30%', top: '35%' }}
        />
      </motion.div>
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
