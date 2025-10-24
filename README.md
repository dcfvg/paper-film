# 🎬 Ciné-Roman

**Transformez vos films en romans photo imprimables** 📽️ ➡️ 📄

Application web qui génère automatiquement des planches de contact imprimables à partir de vidéos et de leurs sous-titres. Les captures sont prises aux moments précis indiqués par les sous-titres.

##  Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez http://localhost:5173 dans votre navigateur.

## 📖 Utilisation

1. **Glissez-déposez** votre vidéo (MP4, MOV, MKV...) et vos sous-titres (SRT ou VTT)
2. **Ajustez** le nombre de captures (6-100)
3. **Générez** la planche de contact
4. **Imprimez** (optimisé A4/Letter)

## ✨ Fonctionnalités

- 🎞️ Support formats vidéo : MP4, AVI, MOV, MKV, WebM, FLV, WMV, M4V
- 📝 Support sous-titres : SRT et VTT
- 🖼️ Captures haute résolution (JPEG 95%)
- 🖨️ Optimisé pour impression A4/Letter
- ⚡ Traitement 100% local (vos fichiers restent privés)
- 📐 Interface responsive et intuitive

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
├── components/    # FileDropzone, ProcessingControls, ContactSheet
├── hooks/         # useFrameCapture
├── utils/         # subtitleParser, videoCapture
├── types/         # Définitions TypeScript
└── test/          # Tests Vitest
```

### Stack technique

- React 18 + TypeScript
- Vite (build tool)
- react-dropzone
- Vitest + Testing Library
- ESLint + Prettier

### Fonctionnement

1. **Parsing** : Les sous-titres SRT/VTT sont parsés pour extraire les timestamps
2. **Capture** : La vidéo est chargée dans un élément `<video>` hors écran
3. **Séquentiel** : Chaque frame est capturée séquentiellement au bon timestamp
4. **Canvas** : L'API Canvas dessine la frame et la convertit en JPEG
5. **Print** : CSS `@media print` optimise pour impression A4/Letter

## � Déploiement GitHub Pages

Le projet est configuré pour un déploiement automatique sur GitHub Pages :

1. **Configurer le repository** :
   - Allez dans Settings > Pages
   - Source : GitHub Actions

2. **Pousser sur main** :
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Accéder à l'application** :
   - Votre site sera disponible sur : `https://username.github.io/cine-roman/`

Le workflow GitHub Actions se déclenche automatiquement à chaque push sur `main`.

## �📄 Licence

MIT - Libre d'utilisation et modification

---

**Développé avec ❤️ pour transformer vos films en romans photo imprimables**
