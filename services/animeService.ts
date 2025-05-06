import AsyncStorage from '@react-native-async-storage/async-storage';
import { Anime, AnimeSearchResult } from '../types/anime';

const API_URL = 'http://localhost:8080/api'; // Será alterado para a URL do seu backend
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

  // Funções de gerenciamento local (serão substituídas pelo backend)
  async saveAnime(anime: Anime): Promise<Anime> {
    try {
      // TODO: Implementar chamada ao backend
      // const response = await fetch(`${API_URL}/animes`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(anime),
      // });
      // if (!response.ok) throw new Error('Erro ao salvar anime');
      // return await response.json();

      // Implementação local temporária
      const animes = await this.getAnimes();
      const newAnime = { ...anime, id: Date.now() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...animes, newAnime]));
      return newAnime;
    } catch (error) {
      console.error('Erro ao salvar anime:', error);
      throw error;
    }
  },

  async getAnimes(): Promise<Anime[]> {
    try {
      // TODO: Implementar chamada ao backend
      // const response = await fetch(`${API_URL}/animes`);
      // if (!response.ok) throw new Error('Erro ao buscar animes');
      // return await response.json();

      // Implementação local temporária
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      throw error;
    }
  },

  async updateAnime(anime: Anime): Promise<Anime> {
    try {
      // TODO: Implementar chamada ao backend
      // const response = await fetch(`${API_URL}/animes/${anime.id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(anime),
      // });
      // if (!response.ok) throw new Error('Erro ao atualizar anime');
      // return await response.json();

      // Implementação local temporária
      const animes = await this.getAnimes();
      const index = animes.findIndex(a => a.id === anime.id);
      if (index === -1) throw new Error('Anime não encontrado');
      
      animes[index] = anime;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(animes));
      return anime;
    } catch (error) {
      console.error('Erro ao atualizar anime:', error);
      throw error;
    }
  },

  async deleteAnime(id: number): Promise<void> {
    try {
      // TODO: Implementar chamada ao backend
      // const response = await fetch(`${API_URL}/animes/${id}`, {
      //   method: 'DELETE',
      // });
      // if (!response.ok) throw new Error('Erro ao excluir anime');

      // Implementação local temporária
      const animes = await this.getAnimes();
      const filteredAnimes = animes.filter(anime => anime.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAnimes));
    } catch (error) {
      console.error('Erro ao excluir anime:', error);
      throw error;
    }
  },

  async getAnime(id: number): Promise<Anime> {
    try {
      // TODO: Implementar chamada ao backend
      // const response = await fetch(`${API_URL}/animes/${id}`);
      // if (!response.ok) throw new Error('Anime não encontrado');
      // return await response.json();

      // Implementação local temporária
      const animes = await this.getAnimes();
      const anime = animes.find(a => a.id === id);
      if (!anime) throw new Error('Anime não encontrado');
      return anime;
    } catch (error) {
      console.error('Erro ao buscar anime:', error);
      throw error;
    }
  },
}; 