import { create } from 'zustand';
import { Agent } from '@/types/agent';

interface ExecutionState {
  isModalOpen: boolean;
  agentToExecute: Agent | null;
  openModal: (agent: Agent) => void;
  closeModal: () => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  isModalOpen: false,
  agentToExecute: null,
  openModal: (agent) => set({ isModalOpen: true, agentToExecute: agent }),
  closeModal: () => set({ isModalOpen: false, agentToExecute: null }),
}));
