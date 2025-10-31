import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { RestartIcon } from './icons/RestartIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { CloseIcon } from './icons/CloseIcon';
import { FlipIcon } from './icons/FlipIcon';
import { LoopIcon } from './icons/LoopIcon';
import { HideIcon } from './icons/HideIcon';
import { BackgroundIcon } from './icons/BackgroundIcon';
import BackgroundSettings from './BackgroundSettings';
import Slider from './ui/Slider';
import Switch from './ui/Switch';

interface ControlsProps {
  isScrolling: boolean;
  settings: Settings;
  progress: number;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  onSettingsChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onEdit: () => void;
  onSeek: (progress: number) => void;
  areControlsManuallyHidden: boolean;
  setAreControlsManuallyHidden: (hidden: boolean) => void;
}

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const Controls: React.FC<ControlsProps> = ({ isScrolling, settings, progress, onStart, onPause, onRestart, onSettingsChange, onEdit, onSeek, areControlsManuallyHidden, setAreControlsManuallyHidden }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackgroundSettingsOpen, setIsBackgroundSettingsOpen] = useState(false);

  useEffect(() => {
    if ((isScrolling && settings.hideControlsWhileScrolling) || areControlsManuallyHidden) {
      setIsSettingsOpen(false);
      setIsBackgroundSettingsOpen(false);
    }
  }, [isScrolling, settings.hideControlsWhileScrolling, areControlsManuallyHidden]);
  
  useEffect(() => {
    if (isSettingsOpen) setIsBackgroundSettingsOpen(false);
  }, [isSettingsOpen]);
  
  useEffect(() => {
    if (isBackgroundSettingsOpen) setIsSettingsOpen(false);
  }, [isBackgroundSettingsOpen]);

  const areControlsHidden = (isScrolling && settings.hideControlsWhileScrolling) || areControlsManuallyHidden;

  return (
    <>
      {isBackgroundSettingsOpen && (
        <BackgroundSettings
          settings={settings}
          onSettingsChange={onSettingsChange}
          onClose={() => setIsBackgroundSettingsOpen(false)}
        />
      )}

      <div 
        className={`absolute bottom-4 right-4 z-30 flex items-center gap-3 transition-opacity duration-300 ${areControlsHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
         <button
          onClick={() => setIsBackgroundSettingsOpen(p => !p)}
          className="w-14 h-14 rounded-full bg-gray-700/80 text-white flex items-center justify-center shadow-lg hover:bg-gray-600/80 transition-transform transform hover:scale-110"
          aria-label="Background Settings"
        >
          <BackgroundIcon className="w-7 h-7"/>
        </button>
        <button
          onClick={() => setAreControlsManuallyHidden(true)}
          className="w-14 h-14 rounded-full bg-gray-700/80 text-white flex items-center justify-center shadow-lg hover:bg-gray-600/80 transition-transform transform hover:scale-110"
          aria-label="Hide Controls"
        >
          <HideIcon className="w-7 h-7"/>
        </button>
        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-110"
          aria-label={isSettingsOpen ? 'Close Settings' : 'Open Settings'}
        >
          {isSettingsOpen ? <CloseIcon className="w-8 h-8"/> : <SettingsIcon className="w-8 h-8"/>}
        </button>
      </div>

      <div 
        className={`fixed bottom-0 left-0 right-0 bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-4 z-20 transition-transform duration-300 ease-in-out ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-white">
          <div className="flex flex-col gap-4">
             <Slider
              label="Font Size"
              value={settings.fontSize}
              min={1}
              max={12}
              step={0.25}
              onChange={(val) => onSettingsChange('fontSize', val)}
              displayValue={`${settings.fontSize.toFixed(2)}rem`}
            />
            <Slider
              label="Line Height"
              value={settings.lineHeight}
              min={1}
              max={3}
              step={0.1}
              onChange={(val) => onSettingsChange('lineHeight', val)}
              displayValue={`${settings.lineHeight.toFixed(1)}`}
            />
             <div className="flex flex-col w-full">
              <label htmlFor="font-family-select" className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
                Font Family
              </label>
              <select
                id="font-family-select"
                value={settings.fontFamily}
                onChange={(e) => onSettingsChange('fontFamily', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                style={{ fontFamily: settings.fontFamily }}
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Switch 
                label="Auto-hide"
                icon={settings.hideControlsWhileScrolling ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                checked={settings.hideControlsWhileScrolling}
                onChange={(val) => onSettingsChange('hideControlsWhileScrolling', val)}
              />
              <Switch 
                label="Mirror X"
                icon={<FlipIcon className="w-5 h-5" />}
                checked={settings.isMirroredX}
                onChange={(val) => onSettingsChange('isMirroredX', val)}
              />
              <Switch 
                label="Mirror Y"
                icon={<FlipIcon className="w-5 h-5 transform rotate-90" />}
                checked={settings.isMirroredY}
                onChange={(val) => onSettingsChange('isMirroredY', val)}
              />
              <Switch 
                label="Loop"
                icon={<LoopIcon className="w-5 h-5" />}
                checked={settings.isLooping}
                onChange={(val) => onSettingsChange('isLooping', val)}
              />
              <Switch
                label="Dark Theme"
                icon={<span className="text-lg">{settings.theme === 'dark' ? '🌙' : '☀️'}</span>}
                checked={settings.theme === 'dark'}
                onChange={(val) => onSettingsChange('theme', val ? 'dark' : 'light')}
              />
            </div>
          </div>
        </div>
      </div>

      <div 
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 w-full max-w-2xl px-4 transition-opacity duration-300 ${areControlsHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
            <Slider
                label="Progress"
                hideLabel={true}
                value={progress}
                min={0}
                max={1}
                step={0.001}
                onChange={onSeek}
            />
        </div>
        <div className="flex items-center gap-4 bg-gray-900/80 dark:bg-black/80 backdrop-blur-sm p-3 rounded-full shadow-2xl">
            <button onClick={onEdit} className="px-4 py-2 text-white bg-gray-700/80 hover:bg-gray-600/80 rounded-full transition">
                Edit Script
            </button>
            <button onClick={onRestart} className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-transform transform hover:scale-110" aria-label="Restart">
                <RestartIcon className="w-6 h-6"/>
            </button>
            <button
                onClick={isScrolling ? onPause : onStart}
                className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg hover:bg-primary-700 transition-transform transform hover:scale-110 text-4xl"
                aria-label={isScrolling ? 'Pause' : 'Play'}
            >
                {isScrolling ? <PauseIcon className="w-10 h-10"/> : <PlayIcon className="w-10 h-10"/>}
            </button>
            <div className="w-48 px-2">
                <Slider
                    label="Speed"
                    hideLabel={true}
                    value={settings.speed}
                    min={0.1}
                    max={20}
                    step={0.1}
                    onChange={(val) => onSettingsChange('speed', val)}
                    />
            </div>
        </div>
      </div>
    </>
  );
};

export default Controls;