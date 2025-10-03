'use client';

import { useExecutionStore } from '@/lib/store/execution-store';
import { ExecutionPanel } from './execution-panel';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function GlobalExecutionModal() {
  const { isModalOpen, agentToExecute, closeModal } = useExecutionStore();

  if (!isModalOpen || !agentToExecute) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
            <h2 className="text-xl font-bold text-white">Executar: {agentToExecute.name}</h2>
            <Button onClick={closeModal} variant="ghost" size="icon" className="text-gray-400 hover:bg-gray-700 hover:text-white">
              <X />
            </Button>
          </div>
          <div className="flex-grow overflow-y-auto p-6">
            <ExecutionPanel agent={agentToExecute} onExecute={closeModal} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
