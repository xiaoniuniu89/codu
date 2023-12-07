"use client";
import { createContext, useContext, useState } from "react";

const defaultContextValue = {
  unsavedChanges: false,
  setUnsavedChanges: () => {},
};

const PromptServiceContext = createContext(defaultContextValue);

export const usePromptService = () => useContext(PromptServiceContext);

export const PromptServiceProvider = ({ children }) => {
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  return (
    <PromptServiceContext.Provider
      value={{ unsavedChanges, setUnsavedChanges }}
    >
      {children}
    </PromptServiceContext.Provider>
  );
};
