
import React from 'react';

interface SwitchProps {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ label, icon, checked, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary-500 ${
          checked ? 'bg-primary-600' : 'bg-gray-600'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 ${
            checked ? 'translate-x-7' : 'translate-x-1'
          }`}
        />
      </button>
      <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
        {icon}
        {label}
      </label>
    </div>
  );
};

export default Switch;
