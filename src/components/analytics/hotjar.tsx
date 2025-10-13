'use client';

import { useEffect } from 'react';

interface HotjarProps {
  hjid: string;
  hjsv: string;
  /** Desabilitar questionários automáticos (você controla manualmente) */
  disableFeedback?: boolean;
  /** Desabilitar gravações de sessão */
  disableRecordings?: boolean;
  /** Desabilitar mapas de calor */
  disableHeatmaps?: boolean;
}

export function Hotjar({ 
  hjid, 
  hjsv,
  disableFeedback = false,
  disableRecordings = false,
  disableHeatmaps = false
}: HotjarProps) {
  useEffect(() => {
    // Verifica se já foi inicializado
    if (typeof window !== 'undefined' && !(window as any).hj) {
      (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
        h.hj = h.hj || function() {
          (h.hj.q = h.hj.q || []).push(arguments);
        };
        h._hjSettings = { hjid: hjid, hjsv: hjsv };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script');
        r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      // Aguarda o Hotjar carregar e aplica configurações
      const checkHotjar = setInterval(() => {
        if ((window as any).hj) {
          // Desabilitar questionários automáticos
          if (disableFeedback) {
            (window as any).hj('trigger', 'feedback_disable');
          }

          // Desabilitar gravações
          if (disableRecordings) {
            (window as any).hj('trigger', 'recording_disable');
          }

          // Desabilitar mapas de calor
          if (disableHeatmaps) {
            (window as any).hj('trigger', 'heatmap_disable');
          }

          clearInterval(checkHotjar);
        }
      }, 100);

      // Limpar após 10 segundos se não carregar
      setTimeout(() => clearInterval(checkHotjar), 10000);
    }
  }, [hjid, hjsv, disableFeedback, disableRecordings, disableHeatmaps]);

  return null;
}
