import { useState, useRef, useEffect } from 'react';
import './FontPicker.css';

interface Font {
  name: string;
  value: string;
  category: string;
}

interface FontPickerProps {
  fonts: Font[];
  value: string;
  onChange: (fontValue: string) => void;
}

export default function FontPicker({ fonts, value, onChange }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFont = fonts.find(f => f.value === value) || fonts[0];

  const filteredFonts = fonts.filter(font =>
    font.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (font: Font) => {
    onChange(font.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="font-picker" ref={dropdownRef}>
      <button
        type="button"
        className="font-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="font-picker-preview" style={{ fontFamily: selectedFont.value }}>
          {selectedFont.name}
        </span>
        <svg
          className={`font-picker-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>

      {isOpen && (
        <div className="font-picker-dropdown">
          <div className="font-picker-search">
            <input
              type="text"
              placeholder="Search fonts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-picker-search-input"
              autoFocus
            />
          </div>

          <div className="font-picker-list" role="listbox">
            {filteredFonts.length === 0 ? (
              <div className="font-picker-empty">No fonts found</div>
            ) : (
              filteredFonts.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  className={`font-picker-option ${font.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(font)}
                  role="option"
                  aria-selected={font.value === value}
                >
                  <span className="font-option-preview" style={{ fontFamily: font.value }}>
                    {font.name}
                  </span>
                  <span className="font-option-category">{font.category}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
