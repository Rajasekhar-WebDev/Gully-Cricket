import React, { createContext, useContext, useState, useEffect } from 'react';
import { playSound as playAudioSound } from '../utils/soundEffects';

const SoundContext = createContext(null);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('gulli_sound_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('gulli_sound_enabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  const play = (type) => {
    playAudioSound(type, soundEnabled);
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound: play }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};
