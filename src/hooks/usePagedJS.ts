import { useEffect } from 'react';

export function usePagedJS(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const handleBeforePrint = () => {
      // Injecter un message simple pour confirmer que la pagination est activée
      const footer = document.querySelector('.page-footer-pagedjs');
      if (footer) {
        footer.textContent = 'Pagination activée - Les numéros de page apparaîtront via les paramètres du navigateur';
      }
    };

    const handleAfterPrint = () => {
      const footer = document.querySelector('.page-footer-pagedjs');
      if (footer) {
        footer.textContent = '';
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [enabled]);
}
