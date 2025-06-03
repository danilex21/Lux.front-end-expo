export interface Anime {
  id: number;
  title: string;
  description: string;
  rating: number;
  genre: string;
  imageUrl: string;
  isFeatured: boolean;
  malId: number;
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
}

export interface AnimeSearchResult {
  mal_id: number;
  title: string;
  synopsis: string;
  score: number;
  genres: Array<{ name: string }>;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    }
  };
}

export interface AnimeStorage {
  animes: Anime[];
} 