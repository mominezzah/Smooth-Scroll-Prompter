import React, { useState, useEffect, useCallback } from 'react';
import { usePrompter } from './hooks/usePrompter';
import Editor from './components/Editor';
import Prompter from './components/Prompter';
import Controls from './components/Controls';
import LibraryPanel from './components/LibraryPanel';
import { DEFAULT_SCRIPT, SETTINGS_KEY, SCRIPTS_LIBRARY_KEY, LAST_ACTIVE_SCRIPT_ID_KEY } from './constants';
import type { Settings, SavedScript } from './types';

const App: React.FC = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [library, setLibrary] = useState<SavedScript[]>([]);
  const [activeScriptId, setActiveScriptId] = useState<string | null>(null);
  const [areControlsManuallyHidden, setAreControlsManuallyHidden] = useState(false);

  const getInitialSettings = (): Settings => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Add defaults for new settings if they don't exist in storage
        return {
          hideControlsWhileScrolling: false,
          backgroundType: 'color',
          backgroundColor: '#000000',
          backgroundImage: null,
          textColor: '#FFFFFF',
          ...parsedSettings,
        };
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
    }
    return {
      speed: 3,
      fontSize: 5,
      lineHeight: 1.5,
      isMirroredX: false,
      isMirroredY: false,
      isLooping: false,
      theme: 'dark',
      fontFamily: 'Arial, sans-serif',
      hideControlsWhileScrolling: false,
      backgroundType: 'color',
      backgroundColor: '#000000',
      backgroundImage: null,
      textColor: '#FFFFFF',
    };
  };

  const [settings, setSettings] = useState<Settings>(getInitialSettings());

  useEffect(() => {
    // 1. Check for script in URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const scriptFromUrl = urlParams.get('script');
    if (scriptFromUrl) {
      try {
        const decodedContent = atob(scriptFromUrl);
        const newScript: SavedScript = {
          id: `url-script-${Date.now()}`,
          title: 'Shared Script (Unsaved)',
          content: decodedContent,
          lastModified: Date.now(),
        };
        // Load library from storage to not overwrite it
        const savedLibraryJSON = localStorage.getItem(SCRIPTS_LIBRARY_KEY);
        const savedLibrary = savedLibraryJSON ? JSON.parse(savedLibraryJSON) : [];
        
        setLibrary([newScript, ...savedLibrary]);
        setActiveScriptId(newScript.id);
        
        // Clean the URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return; // Stop further initialization
      } catch (e) {
        console.error("Failed to decode or load script from URL:", e);
      }
    }

    // 2. Load library from localStorage
    const savedLibraryJSON = localStorage.getItem(SCRIPTS_LIBRARY_KEY);
    const savedLibrary = savedLibraryJSON ? JSON.parse(savedLibraryJSON) : [];
    
    if (savedLibrary.length > 0) {
      setLibrary(savedLibrary);
      const lastActiveId = localStorage.getItem(LAST_ACTIVE_SCRIPT_ID_KEY);
      if (lastActiveId && savedLibrary.some((s: SavedScript) => s.id === lastActiveId)) {
        setActiveScriptId(lastActiveId);
      } else {
        setActiveScriptId(savedLibrary[0].id);
      }
    } else {
      // 3. Create a default script if library is empty
      const defaultScript: SavedScript = {
        id: Date.now().toString(),
        title: 'Welcome Script',
        content: DEFAULT_SCRIPT,
        lastModified: Date.now(),
      };
      setLibrary([defaultScript]);
      setActiveScriptId(defaultScript.id);
    }
  }, []);
  
  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Auto-save library and last active script
  useEffect(() => {
    const libraryToSave = library.filter(script => !script.id.startsWith('url-script'));
    if (libraryToSave.length > 0) {
      localStorage.setItem(SCRIPTS_LIBRARY_KEY, JSON.stringify(libraryToSave));
      if (activeScriptId && !activeScriptId.startsWith('url-script')) {
        localStorage.setItem(LAST_ACTIVE_SCRIPT_ID_KEY, activeScriptId);
      }
    } else {
      // If all scripts are deleted, clear storage
      localStorage.removeItem(SCRIPTS_LIBRARY_KEY);
      localStorage.removeItem(LAST_ACTIVE_SCRIPT_ID_KEY);
    }
  }, [library, activeScriptId]);
  
  const activeScript = library.find(s => s.id === activeScriptId) || null;
  const prompter = usePrompter(activeScript?.content || '', settings);

  const handleSettingsChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleStart = () => {
    if (!activeScript?.content.trim()) return;
    setIsEditing(false);
    prompter.start();
  };

  const handleEdit = () => {
    prompter.pause();
    setIsEditing(true);
  };
  
  const handleSelectScript = (id: string) => {
    setActiveScriptId(id);
  };

  const handleUpdateScript = (id: string, updates: Partial<Pick<SavedScript, 'title' | 'content'>>) => {
    setLibrary(prev =>
      prev.map(script =>
        script.id === id ? { ...script, ...updates, lastModified: Date.now() } : script
      )
    );
  };
  
  const handleCreateNewScript = () => {
    const newScript: SavedScript = {
      id: Date.now().toString(),
      title: 'Untitled Script',
      content: '',
      lastModified: Date.now(),
    };
    setLibrary(prev => [newScript, ...prev]);
    setActiveScriptId(newScript.id);
  };

  const handleDeleteScript = (id: string) => {
    setLibrary(prev => {
      const newLibrary = prev.filter(script => script.id !== id);
      if (activeScriptId === id) {
        if (newLibrary.length > 0) {
          setActiveScriptId(newLibrary[0].id);
        } else {
          setActiveScriptId(null);
        }
      }
      return newLibrary;
    });
  };

  const handleSaveUrlScript = (scriptToSave: SavedScript) => {
    const newScript: SavedScript = {
      ...scriptToSave,
      id: Date.now().toString(), // Assign a new permanent ID
      title: scriptToSave.title.replace(' (Unsaved)', '') || 'Imported Script',
    };
    setLibrary(prev => [newScript, ...prev.filter(s => s.id !== scriptToSave.id)]);
    setActiveScriptId(newScript.id);
  };
  
  const handleImportScripts = (importedScripts: SavedScript[]) => {
    setLibrary(prevLibrary => {
      const existingIds = new Set(prevLibrary.map(s => s.id));
      const newScripts = importedScripts.map((script, index) => {
        if (existingIds.has(script.id)) {
          return { ...script, id: `${Date.now()}-${index}` };
        }
        return script;
      });
      return [...prevLibrary, ...newScripts];
    });
  };

  if (isEditing) {
    return (
      <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <LibraryPanel
          scripts={library}
          activeScriptId={activeScriptId}
          onSelectScript={handleSelectScript}
          onNewScript={handleCreateNewScript}
          onDeleteScript={handleDeleteScript}
          onImportScripts={handleImportScripts}
        />
        <main className="flex-grow flex flex-col h-full">
        {activeScript ? (
          <Editor
            key={activeScript.id}
            script={activeScript}
            onUpdate={handleUpdateScript}
            onStart={handleStart}
            onSaveUrlScript={handleSaveUrlScript}
          />
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400">No Script Selected</h2>
            <p className="mt-2 text-gray-500">Create a new script in the library to get started.</p>
            <button
              onClick={handleCreateNewScript}
              className="mt-6 px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 transition-colors"
            >
              Create Script
            </button>
          </div>
        )}
        </main>
      </div>
    );
  }

  const isAutoHideActive = prompter.isScrolling && settings.hideControlsWhileScrolling;
  const areAllControlsHidden = isAutoHideActive || areControlsManuallyHidden;

  const prompterStyle: React.CSSProperties = {
    fontFamily: settings.fontFamily,
    color: settings.textColor,
  };

  if (settings.backgroundType === 'color') {
    prompterStyle.backgroundColor = settings.backgroundColor;
  } else if (settings.backgroundType === 'image' && settings.backgroundImage) {
    prompterStyle.backgroundImage = `url(${settings.backgroundImage})`;
    prompterStyle.backgroundSize = 'cover';
    prompterStyle.backgroundPosition = 'center';
    prompterStyle.backgroundRepeat = 'no-repeat';
  }

  return (
    <div 
      className={`w-full h-screen overflow-hidden flex flex-col ${!areAllControlsHidden ? 'cursor-pointer' : ''} ${areAllControlsHidden ? 'cursor-none' : ''}`}
      style={prompterStyle}
      onClick={() => {
        if (areControlsManuallyHidden) {
          setAreControlsManuallyHidden(false);
          return;
        }
        if (prompter.isScrolling) {
          prompter.pause();
        } else if (activeScript?.content.trim()) {
          prompter.start();
        }
      }}
    >
      <Prompter
        ref={prompter.prompterRef}
        script={activeScript?.content || ''}
        settings={settings}
      />
      <Controls
        isScrolling={prompter.isScrolling}
        settings={settings}
        progress={prompter.progress}
        onStart={prompter.start}
        onPause={prompter.pause}
        onRestart={prompter.restart}
        onSettingsChange={handleSettingsChange}
        onEdit={handleEdit}
        onSeek={prompter.seek}
        areControlsManuallyHidden={areControlsManuallyHidden}
        setAreControlsManuallyHidden={setAreControlsManuallyHidden}
      />
    </div>
  );
};

export default App;