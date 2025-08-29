import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface IntroContextType {
  hasSeenIntro: boolean;
  markIntroAsSeen: () => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

interface IntroProviderProps {
  children: ReactNode;
}

export const IntroProvider: React.FC<IntroProviderProps> = ({ children }) => {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  const markIntroAsSeen = () => {
    setHasSeenIntro(true);
  };

  return (
    <IntroContext.Provider value={{ hasSeenIntro, markIntroAsSeen }}>
      {children}
    </IntroContext.Provider>
  );
};

export const useIntro = () => {
  const context = useContext(IntroContext);
  if (context === undefined) {
    throw new Error('useIntro must be used within an IntroProvider');
  }
  return context;
};