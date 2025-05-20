export interface Anime {
  id: number;
  title: string;
  description: string;
  rating: number; // Alterado de string para number para corresponder ao Double do backend
  genre: string;
  imageUrl: string;
  mal_id?: number; // ID do MyAnimeList (quando vier da API)
  isFavorite?: boolean; // Campo para controlar se o anime é favorito
  isFeatured?: boolean; // Campo para controlar se o anime está em destaque
  // Novos campos
  episodes?: string;
  status?: string;
  type?: string;
  aired?: string;
  duration?: string;
  source?: string;
  studios?: string;
  producers?: string;
  licensors?: string;
  demographics?: string;
  themes?: string;
  explicit_genres?: string;
  background?: string;
  season?: string;
  year?: string;
  broadcast?: string;
  popularity?: string;
  members?: string;
  favorites?: string;
  releaseDate?: string;
}

export interface AnimeSearchResult {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
  genres: Array<{
    name: string;
  }>;
  score: number;
  status: string;
  episodes: number;
  type: string;
  aired: {
    string: string;
  };
}

export interface AnimeStorage {
  animes: Anime[];
} 