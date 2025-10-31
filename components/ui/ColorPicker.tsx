import React from 'react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`color-picker-${label}`} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        id={`color-picker-${label}`}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 p-0.5 bg-transparent border-2 border-gray-600 rounded-lg cursor-pointer appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
        aria-label={`Select ${label} color`}
      />
    </div>
  );
};

export default ColorPicker;
