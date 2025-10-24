import type { PrintOptions } from '../types';
import './PrintOptions.css';

interface PrintOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
}

export default function PrintOptionsComponent({ options, onChange }: PrintOptionsProps) {
  const handleChange = <K extends keyof PrintOptions>(
    key: K,
    value: PrintOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="print-options">
      <h3>📐 Options d'impression</h3>
      
      <div className="options-grid">
        <div className="option-group">
          <label htmlFor="orientation">
            <strong>Orientation</strong>
          </label>
          <select
            id="orientation"
            value={options.orientation}
            onChange={(e) => handleChange('orientation', e.target.value as 'portrait' | 'landscape')}
            className="option-select"
          >
            <option value="portrait">Portrait (vertical)</option>
            <option value="landscape">Paysage (horizontal)</option>
          </select>
        </div>

        <div className="option-group">
          <label htmlFor="columns">
            <strong>Colonnes par page</strong>
          </label>
          <div className="option-with-preview">
            <input
              id="columns"
              type="range"
              min="2"
              max="4"
              value={options.columns}
              onChange={(e) => handleChange('columns', Number(e.target.value))}
              className="option-slider"
            />
            <span className="option-value">{options.columns}</span>
          </div>
          <div className="option-info">
            {options.columns === 2 && '4 captures/page'}
            {options.columns === 3 && '9 captures/page'}
            {options.columns === 4 && '16 captures/page'}
          </div>
        </div>

        <div className="option-group">
          <label htmlFor="subtitleFontSize">
            <strong>Taille des sous-titres</strong>
          </label>
          <div className="option-with-preview">
            <input
              id="subtitleFontSize"
              type="range"
              min="6"
              max="24"
              value={options.subtitleFontSize}
              onChange={(e) => handleChange('subtitleFontSize', Number(e.target.value))}
              className="option-slider"
            />
            <span className="option-value">{options.subtitleFontSize}pt</span>
          </div>
        </div>

        <div className="option-group">
          <label htmlFor="pageFormat">
            <strong>Format de page</strong>
          </label>
          <select
            id="pageFormat"
            value={options.pageFormat}
            onChange={(e) => handleChange('pageFormat', e.target.value as PrintOptions['pageFormat'])}
            className="option-select"
          >
            <option value="A3">A3 (29.7 × 42 cm)</option>
            <option value="A4">A4 (21 × 29.7 cm)</option>
            <option value="A5">A5 (14.8 × 21 cm)</option>
            <option value="letter">Letter (8.5 × 11 in)</option>
            <option value="legal">Legal (8.5 × 14 in)</option>
            <option value="tabloid">Tabloid (11 × 17 in)</option>
          </select>
        </div>

        <div className="option-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.showTimecodes}
              onChange={(e) => handleChange('showTimecodes', e.target.checked)}
              className="option-checkbox"
            />
            <span>Afficher les timecodes</span>
          </label>
        </div>
      </div>

      <div className="preview-info">
        <strong>Aperçu :</strong> {options.orientation === 'portrait' ? '📄' : '📃'} {' '}
        {options.pageFormat} {options.orientation} • {options.columns}×{options.columns} grille
        {options.showTimecodes ? ' • avec timecodes' : ''}
      </div>
    </div>
  );
}
