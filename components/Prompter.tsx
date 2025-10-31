import React, { forwardRef } from 'react';
import type { Settings } from '../types';

interface PrompterProps {
  script: string;
  settings: Settings;
}

const Prompter = forwardRef<HTMLDivElement, PrompterProps>(({ script, settings }, ref) => {
  const prompterClasses = [
    'w-full',
    'flex-grow',
    'overflow-y-scroll',
    'transition-transform',
    'duration-300',
    'ease-in-out',
    'p-12',
    'md:p-20',
    'lg:p-24',
    settings.isMirroredX ? 'scale-x-[-1]' : '',
    settings.isMirroredY ? 'scale-y-[-1]' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="relative w-full flex-grow overflow-hidden flex justify-center">
      {/* Active Line Highlight */}
      <div 
        className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 z-0 pointer-events-none bg-primary-500/10 border-y border-primary-500/20"
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={prompterClasses}
      >
        <div
          className="text-center whitespace-pre-wrap break-words"
          style={{
            fontSize: `${settings.fontSize}rem`,
            lineHeight: settings.lineHeight,
            transform: settings.isMirroredX || settings.isMirroredY ? 'translateZ(0)' : 'none'
          }}
        >
          {script}
        </div>
      </div>
    </div>
  );
});

Prompter.displayName = 'Prompter';

export default Prompter;