
import React from 'react';

interface SliderProps {
  label: string;
  hideLabel?: boolean;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

const Slider: React.FC<SliderProps> = ({ label, hideLabel = false, value, min, max, step, onChange, displayValue }) => {
  return (
    <div className="flex flex-col w-full">
      {!hideLabel && (
        <label className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
          <span>{label}</span>
          {displayValue && <span className="text-primary-400 font-mono">{displayValue}</span>}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:rounded-full"
        aria-label={label}
      />
    </div>
  );
};

export default Slider;
