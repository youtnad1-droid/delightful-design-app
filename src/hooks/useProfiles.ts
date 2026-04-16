import { useState, useEffect } from "react";
import type { XtreamProfile } from "@/types/xtream";

const STORAGE_KEY = "nadibox_profiles";
const ACTIVE_KEY = "nadibox_active_profile";

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<XtreamProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_KEY);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfileId) localStorage.setItem(ACTIVE_KEY, activeProfileId);
  }, [activeProfileId]);

  const addProfile = (profile: Omit<XtreamProfile, "id">) => {
    const newProfile = { ...profile, id: crypto.randomUUID() };
    setProfiles((prev) => [...prev, newProfile]);
    if (!activeProfileId) setActiveProfileId(newProfile.id);
    return newProfile;
  };

  const removeProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(profiles[0]?.id ?? null);
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) ?? null;

  return { profiles, activeProfile, activeProfileId, setActiveProfileId, addProfile, removeProfile };
};
