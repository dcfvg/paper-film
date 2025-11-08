/**
 * Calcule le nombre estimé de pages imprimées basé sur le nombre d'items
 * et la configuration des colonnes
 */
export function estimatePrintPages(
  itemCount: number,
  columns: number,
  pageHeight: number = 29.7, // A4 en cm
  itemHeight: number = 8 // Hauteur approximative d'un item en cm (image 16:9 + texte)
): number {
  if (itemCount === 0) return 1;

  // Calculer combien d'items par page
  const margin = 2; // Marges en cm (1cm × 2)
  const gap = 1; // Gap entre items en cm
  const availableHeight = pageHeight - margin;
  
  // Nombre de rangées par page
  const rowsPerPage = Math.floor(availableHeight / (itemHeight + gap));
  const itemsPerPage = Math.max(1, rowsPerPage * columns);

  // Calculer le nombre de pages
  const pages = Math.ceil(itemCount / itemsPerPage);

  return Math.max(1, pages);
}

/**
 * Injecte le nombre total de pages dans les éléments .page-total
 * avant l'impression
 */
export function injectTotalPages(totalPages: number): void {
  const pageTotalElements = document.querySelectorAll('.page-total');
  pageTotalElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      el.textContent = totalPages.toString();
    }
  });
}

/**
 * Configure les event listeners pour l'impression avec pagination
 */
export function setupPrintPagination(
  itemCount: number,
  columns: number
): () => void {
  const beforePrint = () => {
    const totalPages = estimatePrintPages(itemCount, columns);
    injectTotalPages(totalPages);
  };

  window.addEventListener('beforeprint', beforePrint);

  // Fonction de nettoyage
  return () => {
    window.removeEventListener('beforeprint', beforePrint);
  };
}
