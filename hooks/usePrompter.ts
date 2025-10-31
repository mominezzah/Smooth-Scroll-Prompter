import { useState, useRef, useCallback, useEffect } from 'react';
import type { Settings } from '../types';

export const usePrompter = (script: string, settings: Settings) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const prompterRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const animationFrameRef = useRef<number>(0);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelLoopTimeout = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    setIsScrolling(false);
    cancelLoopTimeout();
  }, [cancelLoopTimeout]);
  
  const start = useCallback(() => {
    // Check if at the end of the script, if so, reset before starting
    if (prompterRef.current) {
      const prompter = prompterRef.current;
      const maxScroll = prompter.scrollHeight - prompter.clientHeight;
      if (scrollPosRef.current >= maxScroll - 1) { // Small tolerance for float precision
        scrollPosRef.current = 0;
        prompter.scrollTop = 0;
        setProgress(0);
      }
    }
    setIsScrolling(true);
  }, []);

  const restart = useCallback(() => {
    pause();
    scrollPosRef.current = 0;
    if (prompterRef.current) {
      prompterRef.current.scrollTop = 0;
    }
    setProgress(0);
    // Use timeout to allow state to update before starting
    setTimeout(() => start(), 50);
  }, [pause, start]);
  
  // This is the core animation loop
  const scroll = useCallback(() => {
    if (!prompterRef.current) return;
    
    const prompter = prompterRef.current;
    const maxScroll = prompter.scrollHeight - prompter.clientHeight;

    if (maxScroll <= 0) {
      setProgress(1);
      setIsScrolling(false); // Stop if there's nothing to scroll
      return;
    }

    scrollPosRef.current += settings.speed / 10;

    let shouldStop = false;
    if (scrollPosRef.current >= maxScroll) {
      if (settings.isLooping) {
        scrollPosRef.current = maxScroll; // Pin to the end
        prompter.scrollTop = scrollPosRef.current;
        setProgress(1);
        setIsScrolling(false); // Stop animation

        // Schedule a restart after a pause
        loopTimeoutRef.current = setTimeout(() => {
            loopTimeoutRef.current = null;
            restart();
        }, 1500); // 1.5 second pause

        return; // Exit the scroll function for this frame
      } else {
        scrollPosRef.current = maxScroll;
        shouldStop = true;
      }
    }
    
    prompter.scrollTop = scrollPosRef.current;
    setProgress(maxScroll > 0 ? scrollPosRef.current / maxScroll : 0);

    if (shouldStop) {
      setIsScrolling(false);
    } else {
      animationFrameRef.current = requestAnimationFrame(scroll);
    }
  }, [settings.speed, settings.isLooping, restart]);


  // Effect to manage starting/stopping the animation loop based on isScrolling state
  useEffect(() => {
    if (isScrolling) {
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isScrolling, scroll]);

  const seek = useCallback((newProgress: number) => {
    if (!prompterRef.current) return;
    
    // Always pause on seek to prevent scroll position jump conflicts
    pause();

    const prompter = prompterRef.current;
    const maxScroll = prompter.scrollHeight - prompter.clientHeight;
    if (maxScroll <= 0) {
      setProgress(0);
      return;
    };
    
    const clampedProgress = Math.max(0, Math.min(1, newProgress));
    const newScrollPos = clampedProgress * maxScroll;
    scrollPosRef.current = newScrollPos;
    prompter.scrollTop = newScrollPos;
    setProgress(clampedProgress);
  }, [pause]);

  // Reset on script change & clean up on unmount
  useEffect(() => {
    pause();
    // Use timeout to wait for DOM update with new script height
    setTimeout(() => {
      if (prompterRef.current) {
        scrollPosRef.current = 0;
        prompterRef.current.scrollTop = 0;
        setProgress(0);
      }
    }, 50);

    return () => {
        cancelLoopTimeout();
    };
  }, [script, pause, cancelLoopTimeout]);


  return {
    isScrolling,
    prompterRef,
    progress,
    start,
    pause,
    restart,
    seek,
  };
};