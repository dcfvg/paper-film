# 🎬 Ciné-Roman

**Transformez vos films en romans photo imprimables** 📽️ ➡️ 📄

Application web qui génère automatiquement des planches de contact imprimables à partir de vidéos et de leurs sous-titres. Les captures sont prises aux moments précis indiqués par les sous-titres, avec un traitement intelligent pour des phrases fluides.

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

## 📖 Utilisation

1. **Glissez-déposez** votre vidéo (MP4, MOV, MKV...) et vos sous-titres (SRT ou VTT)
2. **L'interface se divise en deux** :
   - **Gauche** : Configuration et réglages
   - **Droite** : Aperçu en temps réel
3. **Ajustez les paramètres** :
   - Nombre de captures (6 à illimité)
   - Décalage temporel (-5s à +5s)
   - Phrases fluides (évite les coupures)
   - Format de page (A3, A4, A5, Letter, Legal, Tabloid)
   - Orientation (portrait/paysage)
   - Nombre de colonnes (2-4)
   - Taille des sous-titres (6-24pt)
   - Échelle de prévisualisation (25-100%)
4. **Les captures se génèrent automatiquement** (avec debounce de 500ms)
5. **Imprimez** directement depuis le bouton ou Ctrl/Cmd+P

## ✨ Fonctionnalités

### Fichiers supportés
- 🎞️ **Vidéos** : MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V
- 📝 **Sous-titres** : SRT et VTT

### Traitement intelligent
- 🧠 **Phrases fluides** : Évite de couper les guillemets, questions, et phrases courtes
- 📏 **Décalage temporel** : Ajustez le timing des captures (-5s à +5s)
- ⚡ **Génération automatique** : Les captures se mettent à jour en temps réel
- 🔄 **Debounce** : Évite la saturation lors des changements de paramètres

### Interface moderne
- 🖼️ **Split View** : Redimensionnable avec poignée de glissement
- 🔍 **Aperçu en temps réel** : Voyez le résultat avant d'imprimer
- 📐 **Zoom** : Affichez plusieurs pages simultanément
- 🎨 **Pages réalistes** : Simulation exacte du rendu final

### Impression optimisée
- 📄 **6 formats** : A3, A4, A5, Letter, Legal, Tabloid
- � **2 orientations** : Portrait et Paysage
- 📊 **Colonnes configurables** : 2, 3 ou 4 colonnes
- 🖨️ **Captures haute résolution** : JPEG 95%
- ⏱️ **Timecodes optionnels** : Activez/désactivez selon vos besoins
- 🔠 **Typographie ajustable** : 6 à 24pt pour les sous-titres

### Confidentialité
- 🔒 **100% local** : Vos fichiers ne quittent jamais votre navigateur
- ⚡ **Aucun serveur** : Traitement entièrement côté client

## 🛠️ Pour les développeurs

### Scripts

```bash
npm run dev      # Développement avec HMR
npm run build    # Build de production
npm run preview  # Preview du build
npm run test     # Tests unitaires
npm run lint     # Vérification ESLint
```

### Architecture

```
src/
├── components/
│   ├── FileDropzone.tsx       # Upload drag & drop
│   ├── SplitView.tsx          # Interface redimensionnable
│   ├── ConfigPanel.tsx        # Panneau de configuration
│   ├── PreviewPanel.tsx       # Aperçu avec pages
│   ├── PrintOptions.tsx       # Options d'impression
│   ├── ContactSheet.tsx       # Legacy (à supprimer)
│   └── LayoutPreview.tsx      # Legacy (à supprimer)
├── hooks/
│   └── useFrameCapture.ts     # Hook pour capturer les frames
├── utils/
│   ├── subtitleParser.ts      # Parsing et logique intelligente
│   └── videoCapture.ts        # Capture vidéo via Canvas
├── types/
│   └── index.ts               # Définitions TypeScript
└── test/
    ├── setup.ts
    └── subtitleParser.test.ts # Tests unitaires
```

### Stack technique

- **React 18** + **TypeScript** : Interface réactive et type-safe
- **Vite 7** : Build ultra-rapide avec HMR
- **react-dropzone** : Drag & drop de fichiers
- **Vitest** + **Testing Library** : Tests unitaires
- **ESLint** : Linting du code
- **HTML5 Video** + **Canvas API** : Capture des frames

### Fonctionnement technique

1. **Upload** :
   - Détection du type MIME pour validation
   - Parsing SRT/VTT avec regex robustes
   
2. **Sélection intelligente** (`selectSubtitles`) :
   - Distribution uniforme si mode simple
   - Logique avancée en mode "phrases fluides" :
     - `endsWithFinalPunctuation()` : Détecte fin de phrase
     - `hasOpenQuote()` : Évite de couper les guillemets
     - `isQuestion()` : Évite de couper les questions
     - `isShortPhrase()` : Évite de couper les phrases < 20 caractères
     - `canCutHere()` : Combine toutes les règles
   - Ajout d'ellipses (...) pour les coupures
   - Application du décalage temporel

3. **Capture séquentielle** :
   - Création d'un `<video>` hors écran
   - Seek précis à chaque timestamp
   - Attente de `seeked` event pour stabilité
   - Dessin sur Canvas puis conversion JPEG 95%
   - Libération de la mémoire (revoke blob URLs)

4. **Debounce automatique** :
   - useEffect avec timer de 500ms
   - Annulation du timer précédent à chaque changement
   - Génération automatique quand les params sont stables

5. **Impression** :
   - `@media print` cache l'interface
   - Seules les pages de contenu sont imprimées
   - `page-break-after` pour pagination propre
   - Dimensions réelles (mm/in) pour formats précis

## 🚀 Déploiement GitHub Pages

Le projet est configuré pour un déploiement automatique sur GitHub Pages :

1. **Configurer le repository** :
   - Allez dans Settings > Pages
   - Source : GitHub Actions

2. **Pousser sur main** :
   ```bash
   git add .
   git commit -m "Update: nouvelle interface split view"
   git push origin main
   ```

3. **Accéder à l'application** :
   - Votre site sera disponible sur : `https://username.github.io/cine-roman/`

Le workflow GitHub Actions (`.github/workflows/deploy.yml`) se déclenche automatiquement à chaque push sur `main`.

## 🎯 Roadmap

- [ ] Support de plusieurs vidéos dans le même projet
- [ ] Export PDF direct (sans passer par l'impression)
- [ ] Templates de mise en page personnalisables
- [ ] Annotations et commentaires sur les captures
- [ ] Historique des projets (LocalStorage)

## 📄 Licence

MIT - Libre d'utilisation et modification

---

**Développé avec ❤️ pour transformer vos films en romans photo imprimables**
