'use client';

import { useCallback } from 'react';

/**
 * Hook para controlar o Hotjar manualmente
 * 
 * @example
 * ```tsx
 * const { showFeedback, trackEvent } = useHotjar();
 * 
 * // Mostrar questionário apenas quando usuário clicar
 * <button onClick={() => showFeedback()}>
 *   Dar Feedback
 * </button>
 * 
 * // Rastrear evento customizado
 * trackEvent('agent_created');
 * ```
 */
export function useHotjar() {
  /**
   * Mostra o widget de feedback do Hotjar
   */
  const showFeedback = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', 'show_feedback');
    }
  }, []);

  /**
   * Esconde o widget de feedback
   */
  const hideFeedback = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', 'hide_feedback');
    }
  }, []);

  /**
   * Rastreia um evento customizado
   * @param eventName - Nome do evento (ex: 'agent_created', 'report_generated')
   */
  const trackEvent = useCallback((eventName: string) => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('event', eventName);
    }
  }, []);

  /**
   * Identifica o usuário atual
   * @param userId - ID único do usuário
   * @param attributes - Atributos adicionais (email, plano, etc)
   */
  const identifyUser = useCallback((
    userId: string, 
    attributes?: Record<string, any>
  ) => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('identify', userId, attributes);
    }
  }, []);

  /**
   * Mostra uma pesquisa específica
   * @param surveyId - ID da pesquisa no Hotjar
   */
  const showSurvey = useCallback((surveyId: string) => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('trigger', surveyId);
    }
  }, []);

  /**
   * Inicia uma gravação de sessão manualmente
   */
  const startRecording = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('stateChange', '/recording-started');
    }
  }, []);

  /**
   * Para a gravação de sessão
   */
  const stopRecording = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).hj) {
      (window as any).hj('stateChange', '/recording-stopped');
    }
  }, []);

  /**
   * Verifica se o Hotjar está carregado
   */
  const isLoaded = useCallback(() => {
    return typeof window !== 'undefined' && !!(window as any).hj;
  }, []);

  return {
    showFeedback,
    hideFeedback,
    trackEvent,
    identifyUser,
    showSurvey,
    startRecording,
    stopRecording,
    isLoaded,
  };
}
