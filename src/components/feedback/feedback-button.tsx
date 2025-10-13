'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHotjar } from '@/hooks/use-hotjar';

interface FeedbackButtonProps {
  /** Texto do botão */
  label?: string;
  /** Variante do botão */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  /** Tamanho do botão */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Classe CSS adicional */
  className?: string;
}

/**
 * Botão para mostrar feedback do Hotjar manualmente
 * 
 * @example
 * ```tsx
 * // Botão padrão
 * <FeedbackButton />
 * 
 * // Botão customizado
 * <FeedbackButton 
 *   label="Enviar Sugestão"
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function FeedbackButton({
  label = 'Dar Feedback',
  variant = 'outline',
  size = 'default',
  className = '',
}: FeedbackButtonProps) {
  const { showFeedback, isLoaded } = useHotjar();

  // Não mostrar botão se Hotjar não estiver carregado
  if (!isLoaded()) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => showFeedback()}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
