import type { PrintOptions } from '../types';
import './PrintOptions.css';

interface PrintOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
}

export default function PrintOptionsComponent({ options, onChange }: PrintOptionsProps) {
  const handleChange = <K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div className="options-grid">
      <div className="option-group">
        <label htmlFor="columns">
          <strong>Colonnes</strong>
        </label>
        <div className="option-with-preview">
          <input
            id="columns"
            type="range"
            min="1"
            max="12"
            value={options.columns}
            onChange={(e) => handleChange('columns', Number(e.target.value))}
            className="option-slider"
          />
          <span className="option-value">{options.columns}</span>
        </div>
      </div>{' '}
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
  );
}
