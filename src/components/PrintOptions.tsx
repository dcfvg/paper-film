import React, { useEffect, useState } from 'react';
import type { PrintOptions } from '../types';
import { FONT_DATABASE, detectAvailableFonts } from '../utils/fontDetector';
import FontPicker from './FontPicker';
import './PrintOptions.css';

interface PrintOptionsProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
  smoothPhrases: boolean;
  onSmoothPhrasesChange: (enabled: boolean) => void;
  isSmoothForced?: boolean;
}

export default function PrintOptionsComponent({
  options,
  onChange,
  smoothPhrases,
  onSmoothPhrasesChange,
  isSmoothForced = false
}: PrintOptionsProps) {
  const [availableFonts, setAvailableFonts] = useState(FONT_DATABASE);

  useEffect(() => {
    // Détecter les polices disponibles au montage du composant
    const detectFonts = async () => {
      const fontNames = FONT_DATABASE.map((f) => f.value);
      const available = await detectAvailableFonts(fontNames);
      const availableSet = new Set(available);

      // Filtrer pour ne garder que les polices disponibles
      const filtered = FONT_DATABASE.filter(
        (font) => font.alwaysAvailable || availableSet.has(font.value)
      );

      setAvailableFonts(filtered);
    };

    detectFonts();
  }, []);
  const handleChange = <K extends keyof PrintOptions>(key: K, value: PrintOptions[K]) => {
    onChange({ ...options, [key]: value });
  };

  const alignmentOptions: Array<{
    value: PrintOptions['subtitleAlignment'];
    label: string;
    icon: React.ReactElement;
  }> = [
    {
      value: 'left',
      label: 'Align left',
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
      label: 'Align center',
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
      label: 'Align right',
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
      <div className="option-group checkbox-group align-controls">
        <div className="font-family-group">
          <label htmlFor="font-family">
            <strong>Font</strong>
          </label>
          <FontPicker
            fonts={availableFonts}
            value={options.subtitleFontFamily}
            onChange={(value) => handleChange('subtitleFontFamily', value)}
          />
        </div>
        <div className="font-size-group">
          <label htmlFor="subtitleFontSize">
            <strong>Size</strong>
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
        <span className="subtitle-align-title">Alignment</span>
        <div className="subtitle-align-buttons" role="group" aria-label="Subtitle alignment">
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
        <div className="checkbox-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={smoothPhrases}
              onChange={(e) => onSmoothPhrasesChange(e.target.checked)}
              disabled={isSmoothForced}
              className="option-checkbox"
              title={
                isSmoothForced
                  ? 'Fluid text is required when there are fewer frames than subtitles'
                  : undefined
              }
            />
            <span>Fluid text {isSmoothForced && <em>(required)</em>}</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={options.showTimecodes}
              onChange={(e) => handleChange('showTimecodes', e.target.checked)}
              className="option-checkbox"
            />
            <span>Timecodes</span>
          </label>
        </div>
      </div>
      <div className="option-group">
        <label htmlFor="columns">
          <strong>Columns</strong>
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
      </div>
    </div>
  );
}
