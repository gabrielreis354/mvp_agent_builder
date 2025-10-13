'use client';

import { useEffect } from 'react';

interface HotjarProps {
  hjid: string;
  hjsv: string;
}

export function Hotjar({ hjid, hjsv }: HotjarProps) {
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
    }
  }, [hjid, hjsv]);

  return null;
}
