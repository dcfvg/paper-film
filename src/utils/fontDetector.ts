/**
 * Détecte si une police est disponible sur le système
 */
export function isFontAvailable(fontName: string): boolean {
  // Créer un canvas invisible pour tester la police
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) return false;

  // Texte de test
  const testString = 'mmmmmmmmmmlli';
  
  // Définir une taille de police
  const fontSize = '72px';
  
  // Police de référence (toujours disponible)
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  
  // Fonction pour obtenir la largeur du texte avec une police donnée
  const getWidth = (font: string): number => {
    context.font = `${fontSize} ${font}`;
    return context.measureText(testString).width;
  };
  
  // Tester la police par rapport aux polices de base
  for (const baseFont of baseFonts) {
    const baseWidth = getWidth(baseFont);
    const testWidth = getWidth(`'${fontName}', ${baseFont}`);
    
    // Si la largeur est différente, la police existe
    if (baseWidth !== testWidth) {
      return true;
    }
  }
  
  return false;
}

/**
 * Détecte les polices disponibles parmi une liste
 */
export async function detectAvailableFonts(fontList: string[]): Promise<string[]> {
  // Vérifier si l'API Font Access est disponible (Chrome 103+)
  if ('queryLocalFonts' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const permission = await (navigator.permissions as any).query({ name: 'local-fonts' });
      
      if (permission.state === 'granted') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fonts = await (window as any).queryLocalFonts();
        const availableFontNames = new Set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fonts.map((font: any) => font.family.toLowerCase())
        );
        
        return fontList.filter(fontName => {
          const cleanName = fontName.replace(/['"]/g, '').split(',')[0].trim().toLowerCase();
          return availableFontNames.has(cleanName);
        });
      }
    } catch {
      console.log('Font Access API not available, using canvas detection');
    }
  }
  
  // Fallback: utiliser la méthode canvas
  return fontList.filter(fontName => {
    const cleanName = fontName.replace(/['"]/g, '').split(',')[0].trim();
    return isFontAvailable(cleanName);
  });
}

/**
 * Liste étendue de polices à détecter
 */
export const FONT_DATABASE = [
  // System
  { name: 'System Default', value: 'system-ui, -apple-system, sans-serif', category: 'System', alwaysAvailable: true },
  
  // Sans-serif communes
  { name: 'Arial', value: 'Arial, sans-serif', category: 'Sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, Arial, sans-serif', category: 'Sans-serif' },
  { name: 'Helvetica Neue', value: '"Helvetica Neue", Helvetica, sans-serif', category: 'Sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif', category: 'Sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif', category: 'Sans-serif' },
  { name: 'Gill Sans', value: '"Gill Sans", sans-serif', category: 'Sans-serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif', category: 'Sans-serif' },
  { name: 'Segoe UI', value: '"Segoe UI", sans-serif', category: 'Sans-serif' },
  { name: 'Calibri', value: 'Calibri, sans-serif', category: 'Sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif', category: 'Sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans-serif' },
  
  // Serif communes
  { name: 'Times New Roman', value: '"Times New Roman", serif', category: 'Serif' },
  { name: 'Times', value: 'Times, serif', category: 'Serif' },
  { name: 'Georgia', value: 'Georgia, serif', category: 'Serif' },
  { name: 'Garamond', value: 'Garamond, serif', category: 'Serif' },
  { name: 'Palatino', value: 'Palatino, serif', category: 'Serif' },
  { name: 'Baskerville', value: 'Baskerville, serif', category: 'Serif' },
  { name: 'Cambria', value: 'Cambria, serif', category: 'Serif' },
  { name: 'Didot', value: 'Didot, serif', category: 'Serif' },
  { name: 'Bodoni', value: 'Bodoni, serif', category: 'Serif' },
  { name: 'Caslon', value: 'Caslon, serif', category: 'Serif' },
  
  // Monospace communes
  { name: 'Courier New', value: '"Courier New", monospace', category: 'Monospace' },
  { name: 'Courier', value: 'Courier, monospace', category: 'Monospace' },
  { name: 'Monaco', value: 'Monaco, monospace', category: 'Monospace' },
  { name: 'Consolas', value: 'Consolas, monospace', category: 'Monospace' },
  { name: 'Menlo', value: 'Menlo, monospace', category: 'Monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace', category: 'Monospace' },
  
  // Display/Script
  { name: 'Impact', value: 'Impact, sans-serif', category: 'Display' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive', category: 'Display' },
  { name: 'Brush Script MT', value: '"Brush Script MT", cursive', category: 'Script' },
  { name: 'Lucida Handwriting', value: '"Lucida Handwriting", cursive', category: 'Script' }
];
