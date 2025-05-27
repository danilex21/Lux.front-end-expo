import { Anime, AnimeSearchResult } from '../types/anime';

const API_URL = 'https://lux-b0a4hhcwf2eveyd0.brazilsouth-01.azurewebsites.net/api'; // URL do backend
const STORAGE_KEY = '@anime_collection';

export const animeService = {
  // Funções de busca na API externa
  async searchAnime(query: string): Promise<AnimeSearchResult[]> {
    try {
      const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&sfw`);
      if (!response.ok) throw new Error('Erro na busca');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      throw error;
    }
  },

  async getTopAnime(): Promise<AnimeSearchResult[]> {
    try {
      const response = await fetch('https://api.jikan.moe/v4/top/anime?sfw');
      if (!response.ok) throw new Error('Erro ao buscar top animes');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao buscar top animes:', error);
      throw error;
    }
  },

  async getPopularAnime(): Promise<AnimeSearchResult[]> {
    try {
      const response = await fetch('https://api.jikan.moe/v4/anime?order_by=popularity&sfw');
      if (!response.ok) throw new Error('Erro ao buscar animes populares');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erro ao buscar animes populares:', error);
      throw error;
    }
  },

  // Funções de gerenciamento com o backend
  async saveAnime(anime: Anime): Promise<Anime> {
    try {
      const response = await fetch(`${API_URL}/animes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(anime),
      });
      if (!response.ok) throw new Error('Erro ao salvar anime');
      return await response.json();
    } catch (error) {
      console.error('Erro ao salvar anime:', error);
      throw error;
    }
  },

  async getAnimes(): Promise<Anime[]> {
    try {
      const response = await fetch(`${API_URL}/animes`);
      if (!response.ok) throw new Error('Erro ao buscar animes');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      throw error;
    }
  },

  async updateAnime(anime: Anime): Promise<Anime> {
    try {
      const response = await fetch(`${API_URL}/animes/${anime.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(anime),
      });
      if (!response.ok) throw new Error('Erro ao atualizar anime');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar anime:', error);
      throw error;
    }
  },

  async deleteAnime(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/animes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir anime');
    } catch (error) {
      console.error('Erro ao excluir anime:', error);
      throw error;
    }
  },

  async getAnime(id: number): Promise<Anime> {
    try {
      const response = await fetch(`${API_URL}/animes/${id}`);
      if (!response.ok) throw new Error('Anime não encontrado');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar anime:', error);
      throw error;
    }
  },
}; 
