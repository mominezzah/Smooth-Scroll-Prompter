import React, { useState, useRef } from 'react';
import type { SavedScript } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { QrCodeIcon } from './icons/QrCodeIcon';
import { ImportIcon } from './icons/ImportIcon';
import { ExportIcon } from './icons/ExportIcon';
import QrCodeModal from './QrCodeModal';

interface LibraryPanelProps {
  scripts: SavedScript[];
  activeScriptId: string | null;
  onSelectScript: (id: string) => void;
  onNewScript: () => void;
  onDeleteScript: (id: string) => void;
  onImportScripts: (scripts: SavedScript[]) => void;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({
  scripts,
  activeScriptId,
  onSelectScript,
  onNewScript,
  onDeleteScript,
  onImportScripts,
}) => {
  const [sharingScript, setSharingScript] = useState<SavedScript | null>(null);
  const [isAppQrModalOpen, setIsAppQrModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDeleteScript(id);
    }
  };

  const generateScriptUrl = (script: SavedScript) => {
    try {
      const encodedScript = btoa(script.content);
      return `${window.location.origin}${window.location.pathname}?script=${encodedScript}`;
    } catch (error) {
      console.error("Failed to encode script for sharing", error);
      return '';
    }
  };

  const handleExport = () => {
    if (window.confirm('Are you sure you want to export all scripts?')) {
      const scriptsToExport = scripts.filter(script => !script.id.startsWith('url-script'));
      const jsonString = JSON.stringify(scriptsToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scripts_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (window.confirm('Are you sure you want to import scripts from this file? This will merge them with your current library.')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read");
                }
                const importedScripts = JSON.parse(text);
                if (Array.isArray(importedScripts) && importedScripts.every(s => 'id' in s && 'title' in s && 'content' in s)) {
                    onImportScripts(importedScripts);
                    alert('Scripts imported successfully!');
                } else {
                    throw new Error("Invalid file format");
                }
            } catch (error) {
                console.error("Failed to import scripts:", error);
                alert('Failed to import scripts. Please make sure the file is a valid script export.');
            } finally {
                 // Reset file input to allow re-uploading the same file
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    } else {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <>
      <aside className="w-full md:w-80 bg-gray-200 dark:bg-gray-800/50 flex-shrink-0 flex flex-col border-r border-gray-300 dark:border-gray-700/50 h-screen">
        <header className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold">Scripts</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAppQrModalOpen(true)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Open on another device"
            >
              <QrCodeIcon className="w-6 h-6" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Import scripts"
            >
              <ImportIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Export all scripts"
            >
              <ExportIcon className="w-6 h-6" />
            </button>
            <button
              onClick={onNewScript}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              aria-label="Create new script"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <div className="flex-grow overflow-y-auto">
          {scripts.length > 0 ? (
            <ul>
              {scripts.map(script => {
                const isActive = script.id === activeScriptId;
                return (
                  <li key={script.id}>
                    <button
                      onClick={() => onSelectScript(script.id)}
                      className={`w-full text-left p-4 flex items-center justify-between gap-2 border-b border-gray-300 dark:border-gray-700/50 transition-colors ${
                        isActive
                          ? 'bg-primary-500/20 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-300/60 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <div className="flex-grow truncate">
                        <p className="font-semibold truncate">{script.title || 'Untitled Script'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(script.lastModified).toLocaleString()}
                        </p>
                      </div>
                      {!script.id.startsWith('url-script') && (
                        <div className="flex items-center flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSharingScript(script); }}
                            className="p-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-100 dark:hover:text-primary-400 dark:hover:bg-primary-900/50"
                            aria-label={`Show QR Code for ${script.title}`}
                          >
                            <QrCodeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, script.id, script.title)}
                            className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-900/50"
                            aria-label={`Delete ${script.title}`}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No scripts yet. Create one to get started!</p>
            </div>
          )}
        </div>
      </aside>
      {sharingScript && (
        <QrCodeModal 
          url={generateScriptUrl(sharingScript)}
          title="Scan to view Script"
          subtitle={`Script: ${sharingScript.title || 'Untitled Script'}`}
          onClose={() => setSharingScript(null)}
        />
      )}
       {isAppQrModalOpen && (
          <QrCodeModal 
            url={window.location.origin + window.location.pathname}
            title="Open App on another device"
            subtitle="Scan to open the Scroll Script Prompter."
            onClose={() => setIsAppQrModalOpen(false)}
          />
        )}
    </>
  );
};

export default LibraryPanel;