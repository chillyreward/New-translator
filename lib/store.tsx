"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserProfile = {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
};

export type SavedPhrase = {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  dateSaved: string;
};

export type AppPreferences = {
  appLanguage: string;
  defaultTargetLanguage: string;
};

type StoreContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  savedPhrases: SavedPhrase[];
  addSavedPhrase: (phrase: Omit<SavedPhrase, "id" | "dateSaved">) => void;
  removeSavedPhrase: (id: string) => void;
  preferences: AppPreferences;
  setPreferences: (prefs: AppPreferences) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>({
    name: "Demo User",
    email: "demo@tafsiri.com",
    bio: "Language enthusiast.",
    avatarUrl: "",
  });

  const [savedPhrases, setSavedPhrasesState] = useState<SavedPhrase[]>([]);

  const [preferences, setPreferencesState] = useState<AppPreferences>({
    appLanguage: "English",
    defaultTargetLanguage: "Gikuyu",
  });

  const [mounted, setMounted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("tafsiri_profile");
    if (savedProfile) setProfileState(JSON.parse(savedProfile));

    const savedPhrases = localStorage.getItem("tafsiri_phrases");
    if (savedPhrases) setSavedPhrasesState(JSON.parse(savedPhrases));

    const savedPrefs = localStorage.getItem("tafsiri_prefs");
    if (savedPrefs) setPreferencesState(JSON.parse(savedPrefs));

    setMounted(true);
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    localStorage.setItem("tafsiri_profile", JSON.stringify(newProfile));
  };

  const addSavedPhrase = (phrase: Omit<SavedPhrase, "id" | "dateSaved">) => {
    const newPhrase: SavedPhrase = {
      ...phrase,
      id: Date.now().toString(),
      dateSaved: new Date().toISOString(),
    };
    const updated = [newPhrase, ...savedPhrases];
    setSavedPhrasesState(updated);
    localStorage.setItem("tafsiri_phrases", JSON.stringify(updated));
  };

  const removeSavedPhrase = (id: string) => {
    const updated = savedPhrases.filter((p) => p.id !== id);
    setSavedPhrasesState(updated);
    localStorage.setItem("tafsiri_phrases", JSON.stringify(updated));
  };

  const setPreferences = (newPrefs: AppPreferences) => {
    setPreferencesState(newPrefs);
    localStorage.setItem("tafsiri_prefs", JSON.stringify(newPrefs));
  };

  return (
    <StoreContext.Provider
      value={{
        profile,
        setProfile,
        savedPhrases,
        addSavedPhrase,
        removeSavedPhrase,
        preferences,
        setPreferences,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
