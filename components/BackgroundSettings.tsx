import React from 'react';
import type { Settings } from '../types';
import ColorPicker from './ui/ColorPicker';
import { CloseIcon } from './icons/CloseIcon';

interface BackgroundSettingsProps {
  settings: Settings;
  onSettingsChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onClose: () => void;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({ settings, onSettingsChange, onClose }) => {
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image file is too large (max 5MB). Please choose a smaller file.');
        e.target.value = ''; // Reset file input
        return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === 'string') {
            onSettingsChange('backgroundImage', result);
        }
        };
        reader.onerror = () => {
            alert('Failed to read the image file.');
        }
        reader.readAsDataURL(file);
    };
    
    const handleRemoveImage = () => {
        onSettingsChange('backgroundImage', null);
    };
    
    return (
        <div 
            className="absolute bottom-24 right-4 z-40 w-72 bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 rounded-lg shadow-2xl text-white" 
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-200">Background & Colors</h3>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                    <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
            
            <div className="p-1 bg-gray-700 rounded-lg flex gap-1 mb-3">
                <button onClick={() => onSettingsChange('backgroundType', 'color')} className={`w-1/2 py-1.5 text-sm font-semibold rounded-md transition-colors ${settings.backgroundType === 'color' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Color</button>
                <button onClick={() => onSettingsChange('backgroundType', 'image')} className={`w-1/2 py-1.5 text-sm font-semibold rounded-md transition-colors ${settings.backgroundType === 'image' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>Image</button>
            </div>

            {settings.backgroundType === 'color' ? (
                <div className="flex items-center justify-around gap-4">
                    <ColorPicker label="Background" value={settings.backgroundColor} onChange={(val) => onSettingsChange('backgroundColor', val)} />
                    <ColorPicker label="Text" value={settings.textColor} onChange={(val) => onSettingsChange('textColor', val)} />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <label className="flex-grow px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-lg cursor-pointer transition-colors text-white text-center">
                            Upload Image
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                        {settings.backgroundImage && (
                            <button onClick={handleRemoveImage} className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white flex-shrink-0">
                            Remove
                            </button>
                        )}
                    </div>
                     <div className="flex justify-center border-t border-gray-700 pt-3 mt-1">
                        <ColorPicker label="Text" value={settings.textColor} onChange={(val) => onSettingsChange('textColor', val)} />
                     </div>
                </div>
            )}
        </div>
    );
};

export default BackgroundSettings;
