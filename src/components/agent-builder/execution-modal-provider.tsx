'use client'

import { useExecutionStore } from '@/lib/store/execution-store';
import { AgentExecutionModalV2 } from './agent-execution-modal-v2';

export function ExecutionModalProvider() {
  const { isModalOpen, agentToExecute, closeModal } = useExecutionStore();

  if (!isModalOpen || !agentToExecute) {
    return null;
  }

  return (
    <AgentExecutionModalV2
      isOpen={isModalOpen}
      onClose={closeModal}
      agent={agentToExecute}
      onExecutionComplete={() => {
        closeModal();
      }}
    />
  );
}
