import React, { useState } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { ShareIcon } from './icons/ShareIcon';
import type { SavedScript } from '../types';

interface EditorProps {
  script: SavedScript;
  onUpdate: (id: string, updates: Partial<Pick<SavedScript, 'title' | 'content'>>) => void;
  onStart: () => void;
  onSaveUrlScript: (script: SavedScript) => void;
}

const Editor: React.FC<EditorProps> = ({
  script,
  onUpdate,
  onStart,
  onSaveUrlScript,
}) => {
  const [shareFeedback, setShareFeedback] = useState('');

  const handleShare = () => {
    try {
      const encodedScript = btoa(script.content);
      const url = `${window.location.origin}${window.location.pathname}?script=${encodedScript}`;
      navigator.clipboard.writeText(url);
      setShareFeedback('Copied to clipboard!');
      setTimeout(() => setShareFeedback(''), 2000);
    } catch (error) {
      console.error("Failed to share script", error);
      setShareFeedback('Failed to copy link.');
      setTimeout(() => setShareFeedback(''), 2000);
    }
  };

  const isUrlScript = script.id.startsWith('url-script');

  return (
    <div className="flex-grow flex flex-col p-4 sm:p-6 md:p-8 h-full">
      <header className="mb-4 w-full flex justify-between items-center gap-4">
        <input
          type="text"
          value={script.title}
          onChange={(e) => onUpdate(script.id, { title: e.target.value })}
          readOnly={isUrlScript}
          className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 bg-transparent border-none focus:ring-0 p-0 w-full"
          placeholder="Untitled Script"
        />
        <div className="relative">
          <button
            onClick={handleShare}
            className="p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
            aria-label="Share script"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
          {shareFeedback && (
            <div className="absolute top-full right-0 mt-2 text-xs bg-gray-800 text-white px-2 py-1 rounded-md shadow-lg">
              {shareFeedback}
            </div>
          )}
        </div>
      </header>
      
      {isUrlScript && (
        <div className="mb-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg flex items-center justify-between gap-4">
          <p className="text-sm text-primary-700 dark:text-primary-300">This is a shared script. Save it to your library to keep it.</p>
          <button 
            onClick={() => onSaveUrlScript(script)}
            className="px-4 py-1.5 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 transition-colors flex-shrink-0"
          >
            Save to Library
          </button>
        </div>
      )}
      
      <textarea
        value={script.content}
        onChange={(e) => onUpdate(script.id, { content: e.target.value })}
        className="flex-grow w-full p-4 sm:p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg shadow-inner bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-200 text-base md:text-lg leading-relaxed resize-none"
        placeholder="Type or paste your script here..."
      />

      <div className="mt-6 flex justify-center">
        <button
          onClick={onStart}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-primary-700 active:bg-primary-800 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/50"
        >
          <PlayIcon className="w-6 h-6" />
          <span>Start Prompting</span>
        </button>
      </div>
    </div>
  );
};

export default Editor;
