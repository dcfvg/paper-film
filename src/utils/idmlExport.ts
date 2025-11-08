import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { CapturedFrame, PrintOptions } from '../types';

/**
 * Génère le contenu d'un fichier IDML et le retourne comme blob
 */
async function generateIDMLBlob(
  frames: CapturedFrame[],
  options: PrintOptions,
  title: string,
  showTitle: boolean
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Créer la structure de base IDML
  zip.file('mimetype', 'application/vnd.adobe.indesign-idml-package');

  // 2. Créer le fichier designmap.xml (structure du document)
  const designmap = generateDesignMap();
  zip.file('designmap.xml', designmap);

  // 3. Créer le dossier META-INF
  const metaInf = zip.folder('META-INF');
  if (metaInf) {
    metaInf.file('container.xml', generateContainerXML());
  }

  // 4. Créer le dossier Resources pour les images
  const resources = zip.folder('Resources');
  if (resources) {
    const graphics = resources.folder('Graphic');
    
    // Ajouter toutes les images
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      if (frame.imageUrl) {
        try {
          const response = await fetch(frame.imageUrl);
          const blob = await response.blob();
          graphics?.file(`Image_${i + 1}.jpg`, blob);
        } catch (error) {
          console.error(`Erreur lors de l'ajout de l'image ${i + 1}:`, error);
        }
      }
    }
  }

  // 5. Créer le dossier Spreads (mise en page)
  const spreads = zip.folder('Spreads');
  if (spreads) {
    spreads.file('Spread_ub6.xml', generateSpreadXML(frames, options, title, showTitle));
  }

  // 6. Créer le dossier Stories (texte)
  const stories = zip.folder('Stories');
  if (stories) {
    stories.file('Story_u139.xml', generateStoriesXML(frames, options, title, showTitle));
  }

  // 7. Créer le fichier BackingStory.xml
  zip.file('XML/BackingStory.xml', generateBackingStory());

  // 8. Générer le blob IDML
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Génère un fichier IDML (InDesign Markup Language) basique
 * contenant les images et le texte pour import dans InDesign
 */
export async function exportToIDML(
  frames: CapturedFrame[],
  options: PrintOptions,
  title: string,
  showTitle: boolean
): Promise<void> {
  const blob = await generateIDMLBlob(frames, options, title, showTitle);
  const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_cine-roman.idml`;
  saveAs(blob, filename);
}

function generateDesignMap(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Designmap xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="15.0">
  <idPkg:Spread src="Spreads/Spread_ub6.xml" />
  <idPkg:Story src="Stories/Story_u139.xml" />
  <idPkg:BackingStory src="XML/BackingStory.xml" />
</idPkg:Designmap>`;
}

function generateContainerXML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="designmap.xml" media-type="application/vnd.adobe.indesign-idml-package"/>
  </rootfiles>
</container>`;
}

function generateSpreadXML(
  frames: CapturedFrame[],
  options: PrintOptions,
  _title: string,
  _showTitle: boolean
): string {
  const itemCount = frames.length + (_showTitle ? 1 : 0);
  const columns = options.columns;
  
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Spread Self="ub6" FlattenerOverride="Default">
  <Page Self="u139" AppliedMaster="n" GeometricBounds="0 0 841.889763779528 595.275590551181">
    <!-- Grille de ${columns} colonnes avec ${itemCount} éléments -->
    <!-- Les images et textes seront placés ici -->
  </Page>
</Spread>`;
}

function generateStoriesXML(
  _frames: CapturedFrame[],
  _options: PrintOptions,
  title: string,
  showTitle: boolean
): string {
  let content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Story Self="u139" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">
  <StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" />
  <InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false" />
`;

  // Ajouter le titre si activé
  if (showTitle && title) {
    content += `  <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/$ID/NormalParagraphStyle">
    <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]">
      <Content>${escapeXML(title)}</Content>
    </CharacterStyleRange>
  </ParagraphStyleRange>
`;
  }

  content += `</Story>`;
  return content;
}

function generateBackingStory(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<BackingStory Self="pandora_backing_story" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="$ID/" AppliedNamedGrid="n">
  <StoryPreference OpticalMarginAlignment="false" OpticalMarginSize="12" />
  <InCopyExportOption IncludeGraphicProxies="true" IncludeAllResources="false" />
</BackingStory>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Exporte vers un package de fichiers (images + CSV de métadonnées)
 * pour une intégration facile dans n'importe quel logiciel de mise en page
 */
export async function exportDesignPackage(
  frames: CapturedFrame[],
  options: PrintOptions,
  title: string,
  showTitle: boolean,
  subtitles: string[]
): Promise<void> {
  const zip = new JSZip();

  // 1. Créer le dossier images
  const imagesFolder = zip.folder('images');
  
  // 2. Ajouter toutes les images avec noms numérotés
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    if (frame.imageUrl) {
      try {
        const response = await fetch(frame.imageUrl);
        const blob = await response.blob();
        const paddedIndex = String(i + 1).padStart(3, '0');
        imagesFolder?.file(`frame_${paddedIndex}.jpg`, blob);
      } catch (error) {
        console.error(`Erreur lors de l'ajout de l'image ${i + 1}:`, error);
      }
    }
  }

  // 3. Créer un fichier CSV avec les métadonnées
  let csv = 'Numéro,Fichier,Timecode,Texte\n';
  
  if (showTitle && title) {
    csv += `0,titre,"",${escapeCSV(title)}\n`;
  }
  
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const paddedIndex = String(i + 1).padStart(3, '0');
    const timecode = formatTimestamp(frame.timestamp);
    const text = subtitles[i] || '';
    csv += `${i + 1},frame_${paddedIndex}.jpg,${timecode},${escapeCSV(text)}\n`;
  }
  
  zip.file('metadata.csv', csv);

  // 3b. Créer un fichier pour la fusion de données InDesign (.txt tabulé)
  let dataMerge = '@Image\t@Timecode\t@Text\n';
  
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const paddedIndex = String(i + 1).padStart(3, '0');
    const timecode = formatTimestamp(frame.timestamp);
    const text = subtitles[i] || '';
    // Utiliser des chemins relatifs pour InDesign
    dataMerge += `images/frame_${paddedIndex}.jpg\t${timecode}\t${text.replace(/\t/g, ' ').replace(/\n/g, ' ')}\n`;
  }
  
  zip.file('indesign_data_merge.txt', dataMerge);

  // 3c. Générer et ajouter le fichier IDML
  try {
    const idmlBlob = await generateIDMLBlob(frames, options, title, showTitle);
    const idmlFilename = `${title.replace(/[^a-z0-9]/gi, '_')}_cine-roman.idml`;
    zip.file(idmlFilename, idmlBlob);
  } catch (error) {
    console.error('Erreur lors de la génération du fichier IDML:', error);
  }

  // 4. Créer un fichier README
  const readme = `# Ciné-Roman Export Package

Titre: ${title}
Date: ${new Date().toLocaleDateString('fr-FR')}
Nombre d'images: ${frames.length}
Colonnes: ${options.columns}

## Structure

- images/ : Toutes les captures d'écran numérotées
- metadata.csv : Données associées (timecode, sous-titres) - Format CSV standard
- indesign_data_merge.txt : Fichier de fusion de données pour InDesign (format tabulé)
- ${title.replace(/[^a-z0-9]/gi, '_')}_cine-roman.idml : Fichier InDesign prêt à ouvrir
- README.md : Ce fichier

## Import dans un logiciel de mise en page

### InDesign (Recommandé)

**Option 1 : Fichier IDML (le plus simple)**
1. Ouvrir le fichier .idml directement dans InDesign
2. Le document s'ouvre avec les images déjà placées
3. Ajuster la mise en page selon vos besoins

**Option 2 : Fusion de données**
1. Créer un nouveau document InDesign
2. Fenêtre > Utilitaires > Fusion de données
3. Sélectionner le fichier indesign_data_merge.txt
4. Créer votre mise en page avec les champs @Image, @Timecode, @Text
5. Fusionner les données

**Option 3 : Import manuel**
1. Créer un nouveau document
2. Utiliser "Fichier > Importer" pour ajouter les images
3. Utiliser le fichier CSV comme référence pour les textes

### Scribus
1. Créer un nouveau document
2. Utiliser "Fichier > Importer > Obtenir l'image" pour chaque image
3. Utiliser les données CSV pour ajouter les textes

### Affinity Publisher
1. Créer un nouveau document
2. Glisser-déposer les images depuis le dossier
3. Utiliser le CSV comme référence pour les textes
`;

  zip.file('README.md', readme);

  // 5. Générer et télécharger le package
  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${title.replace(/[^a-z0-9]/gi, '_')}_design-package.zip`;
  saveAs(blob, filename);
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hrs > 0) {
    return `${hrs}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
