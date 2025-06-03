import axios from 'axios';
import { Anime, AnimeSearchResult } from '../types/anime';

const API_URL = 'https://anime-collection-nf6r.onrender.com/api'; // URL do backend
const STORAGE_KEY = '@anime_collection';

// Configuração global do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 300, // Considera apenas 2xx como sucesso
});

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
  async saveAnime(anime: Anime | AnimeSearchResult): Promise<Anime> {
    try {
      console.log('Dados recebidos para salvar:', JSON.stringify(anime, null, 2));
      
      // Garante que temos os dados mínimos necessários
      if (!anime.title) {
        throw new Error('O título do anime é obrigatório');
      }

      // Transforma o anime para o formato esperado pelo backend
      const animeToSave = {
        title: String(anime.title).trim(),
        description: ('description' in anime ? anime.description : 
                    'synopsis' in anime ? (anime as AnimeSearchResult).synopsis : 'Sem descrição')?.toString().trim(),
        imageUrl: ('imageUrl' in anime ? anime.imageUrl : 
                 (anime as AnimeSearchResult).images?.jpg?.image_url || '')?.toString().trim(),
        rating: Math.min(10, Math.max(0, Number(
          'rating' in anime ? anime.rating : 
          'score' in anime ? (anime as AnimeSearchResult).score : 0
        ))),
        genre: ('genre' in anime ? anime.genre : 
              (anime as AnimeSearchResult).genres?.[0]?.name || 'Desconhecido')?.toString().trim() || 'Desconhecido',
        isFeatured: false,
        malId: ('mal_id' in anime ? anime.mal_id : 
               'malId' in anime ? (anime as Anime).malId : 0)
      };

      // Validação adicional dos dados
      if (!animeToSave.title) {
        throw new Error('O título do anime não pode estar vazio');
      }
      if (isNaN(animeToSave.rating)) {
        animeToSave.rating = 0;
      }

      console.log('Dados processados para envio:', JSON.stringify(animeToSave, null, 2));

      try {
        const response = await api.post('/animes', animeToSave);
        console.log('Resposta do servidor:', response.data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Detalhes do erro:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              data: error.config?.data,
            }
          });
          
          throw new Error(`Erro ao salvar anime (${error.response?.status}): ${error.response?.data?.message || error.message}`);
        }
        throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar anime:', error);
      throw error;
    }
  },

  async getAnimes(): Promise<Anime[]> {
    try {
      const response = await api.get('/animes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      throw error;
    }
  },

  async searchMyAnimes(query: string): Promise<Anime[]> {
    try {
      const response = await api.get(`/animes/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      throw error;
    }
  },

  async getAnimesByGenre(genre: string): Promise<Anime[]> {
    try {
      const response = await api.get(`/animes/genre/${encodeURIComponent(genre)}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar animes por gênero:', error);
      throw error;
    }
  },

  async updateAnime(anime: Anime): Promise<Anime> {
    try {
      const response = await api.put(`/animes/${anime.id}`, anime);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar anime:', error);
      throw error;
    }
  },

  async deleteAnime(id: number): Promise<void> {
    try {
      await api.delete(`/animes/${id}`);
    } catch (error) {
      console.error('Erro ao deletar anime:', error);
      throw error;
    }
  },

  async getAnime(id: number): Promise<Anime> {
    try {
      const response = await api.get(`/animes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar anime:', error);
      throw error;
    }
  }
}; 
