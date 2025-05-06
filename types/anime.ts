export interface Anime {
  id: number;
  title: string;
  description: string;
  rating: string;
  genre: string;
  image: string;
  mal_id?: number; // ID do MyAnimeList (quando vier da API)
  isFavorite?: boolean; // Campo para controlar se o anime é favorito
  isFeatured?: boolean; // Campo para controlar se o anime está em destaque
}

export interface AnimeSearchResult {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  genres: Array<{
    name: string;
  }>;
  score: number;
}

export interface AnimeStorage {
  animes: Anime[];
} 