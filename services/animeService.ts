import { Anime, AnimeSearchResult } from '../types/anime';
import axios from 'axios';

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
        // Garante que a URL da imagem seja válida ou uma string vazia
        imageUrl: ('imageUrl' in anime ? anime.imageUrl : 
                 (anime as AnimeSearchResult).images?.jpg?.image_url || '')?.toString().trim(),
        // Garante que o rating seja um número entre 0 e 10
        rating: Math.min(10, Math.max(0, Number(
          'rating' in anime ? anime.rating : 
          'score' in anime ? (anime as AnimeSearchResult).score : 0
        ))),
        // Garante que o gênero seja uma string não vazia
        genre: ('genre' in anime ? anime.genre : 
              (anime as AnimeSearchResult).genres?.[0]?.name || 'Desconhecido')?.toString().trim() || 'Desconhecido'
      };

      // Validação adicional dos dados
      if (!animeToSave.title) {
        throw new Error('O título do anime não pode estar vazio');
      }
      if (isNaN(animeToSave.rating)) {
        animeToSave.rating = 0; // Valor padrão se não for um número válido
      }

      console.log('Dados processados para envio:', JSON.stringify(animeToSave, null, 2));

      console.log('Enviando requisição para:', `${API_URL}/animes`);
      console.log('Dados da requisição:', animeToSave);

      try {
        const response = await api.post('/animes', animeToSave);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const errorMessage = `Erro ao salvar anime (${error.response?.status || 'Sem status'}): ${error.response?.data?.message || error.message || 'Erro desconhecido'}`;
          
          console.error('Erro na requisição:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              headers: error.config?.headers,
              data: error.config?.data,
            }
          });
          
          throw new Error(errorMessage);
        }
        
        console.error('Erro inesperado:', error);
        throw new Error(`Erro inesperado ao salvar anime: ${error instanceof Error ? error.message : String(error)}`);
      }
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
