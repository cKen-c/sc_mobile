import React, { createContext, useContext, useEffect, useState } from 'react';
import client from '../api/client';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await client.get('/favorites');
      setFavorites(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const isFavorite = (team) => {
    if (!team) return false;
    return favorites.some(fav => fav.teamApiId === (team.id || team.teamApiId));
  };

  const toggleFavorite = async (team) => {
    try {
      await client.post('/favorites/toggle', {
        teamApiId: team.id || team.teamApiId,
        teamName: team.name || team.teamName,
        teamTla: team.tla || team.teamTla,
        teamCrest: team.crest || team.teamCrest,
      });
      setFavorites((prev) => {
        const id = team.id || team.teamApiId;
        const exists = prev.some(fav => fav.teamApiId === id);
        if (exists) {
          return prev.filter(fav => fav.teamApiId !== id);
        } else {
          return [
            ...prev,
            {
              teamApiId: id,
              teamName: team.name || team.teamName,
              teamTla: team.tla || team.teamTla,
              teamCrest: team.crest || team.teamCrest,
            },
          ];
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
