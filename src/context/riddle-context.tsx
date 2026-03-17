'use client';

import React, { createContext, useState, type Dispatch, type SetStateAction, type ReactNode } from 'react';

interface RiddleContextType {
  currentConstraints: string | null;
  setCurrentConstraints: Dispatch<SetStateAction<string | null>>;
}

// Create the context with a default value
export const RiddleContext = createContext<RiddleContextType>({
  currentConstraints: null,
  setCurrentConstraints: () => null, // Default setter does nothing
});

interface RiddleProviderProps {
  children: ReactNode;
}

// Create a provider component
export function RiddleProvider({ children }: RiddleProviderProps) {
  const [currentConstraints, setCurrentConstraints] = useState<string | null>(null);

  return (
    <RiddleContext.Provider value={{ currentConstraints, setCurrentConstraints }}>
      {children}
    </RiddleContext.Provider>
  );
}
