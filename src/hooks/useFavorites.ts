import { useState, useEffect } from "react";

type Kind = "live" | "movie" | "series";

const key = (profileId: string, kind: Kind) => `nadibox_fav_${profileId}_${kind}`;

export const useFavorites = (profileId: string | null | undefined, kind: Kind) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!profileId) return setFavorites(new Set());
    const saved = localStorage.getItem(key(profileId, kind));
    setFavorites(saved ? new Set(JSON.parse(saved)) : new Set());
  }, [profileId, kind]);

  const toggle = (id: string) => {
    if (!profileId) return;
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(key(profileId, kind), JSON.stringify([...next]));
      return next;
    });
  };

  return { favorites, toggle, isFavorite: (id: string) => favorites.has(id) };
};
