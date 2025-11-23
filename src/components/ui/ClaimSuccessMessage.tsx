'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Typography } from './typography';
import { CheckCircle, Coins, Sparkles, Trophy } from 'lucide-react';

interface ClaimSuccessMessageProps {
  tokenAmount: string;
  transactionId?: string;
}

export const ClaimSuccessMessage: React.FC<ClaimSuccessMessageProps> = ({ 
  tokenAmount, 
  transactionId 
}) => {
  console.log('🎉 [SUCCESS_MSG] Rendering ClaimSuccessMessage component');
  console.log('   Token amount:', tokenAmount);
  console.log('   Transaction ID:', transactionId);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }}
      className="mb-6 p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl shadow-lg"
    >
      <div className="text-center space-y-4">
        {/* Success Icon with Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        {/* Success Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-3"
        >
          <Typography variant="h3" className="text-green-700 dark:text-green-300 font-bold">
            🎉 Claim Successful!
          </Typography>
          
          <Typography variant="paragraph" className="text-green-600 dark:text-green-400 text-lg">
            Your {tokenAmount} SIZ tokens are now in your wallet!
          </Typography>
        </motion.div>

        {/* Token Amount Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white dark:bg-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-600 shadow-inner"
        >
          <div className="flex items-center justify-center gap-3">
            <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
            <Typography variant="h4" className="text-green-700 dark:text-green-300 font-bold">
              {tokenAmount} SIZ
            </Typography>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
        </motion.div>

        {/* Transaction Details */}
        {transactionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
          >
            <Typography variant="small" className="text-gray-600 dark:text-gray-400 mb-2">
              Transaction ID:
            </Typography>
            <Typography variant="small" className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
              {transactionId}
            </Typography>
          </motion.div>
        )}

        {/* Celebration Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <Typography variant="small" className="text-yellow-700 dark:text-yellow-300 font-medium">
              🚀 Ready to trade, stake, or grow your SIZ portfolio!
            </Typography>
          </div>
        </motion.div>

        {/* Auto-refresh Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <Typography variant="small" className="text-gray-500 dark:text-gray-400">
            💡 Your wallet balance will refresh automatically in a few seconds
          </Typography>
        </motion.div>
      </div>
    </motion.div>
  );
};
