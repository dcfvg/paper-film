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

  const alignmentOptions: Array<{
    value: PrintOptions['subtitleAlignment'];
    label: string;
    icon: JSX.Element;
  }> = [
    {
      value: 'left',
      label: 'Aligner à gauche',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="4" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      value: 'center',
      label: 'Aligner au centre',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="7" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    },
    {
      value: 'right',
      label: 'Aligner à droite',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" />
          <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" />
          <line x1="6" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" />
        </svg>
      )
    }
  ];

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
      <div className="option-group checkbox-group align-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.showTimecodes}
            onChange={(e) => handleChange('showTimecodes', e.target.checked)}
            className="option-checkbox"
          />
          <span>Afficher les timecodes</span>
        </label>
        <div className="subtitle-align-header">
          <span className="subtitle-align-title">Alignement du texte</span>
        </div>
        <div className="subtitle-align-buttons" role="group" aria-label="Alignement des sous-titres">
          {alignmentOptions.map((align) => (
            <button
              key={align.value}
              type="button"
              className={`subtitle-align-button ${
                options.subtitleAlignment === align.value ? 'active' : ''
              }`}
              title={align.label}
              onClick={() => handleChange('subtitleAlignment', align.value)}
              aria-pressed={options.subtitleAlignment === align.value}
            >
              <span className="subtitle-align-icon" aria-hidden="true">
                {align.icon}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
