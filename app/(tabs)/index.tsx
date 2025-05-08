import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Modal, Paragraph, Portal, Text, Title } from 'react-native-paper';
import { styles as globalStyles, theme } from '../../constants/theme';
import { animeService } from '../../services/animeService';
import { Anime, AnimeSearchResult } from '../../types/anime';

const { width } = Dimensions.get('window');
const FEATURED_WIDTH = width;
const FEATURED_HEIGHT = width * 0.5;
const CARD_WIDTH = width * 0.42;
const CARD_HEIGHT = CARD_WIDTH * 1.45;

export default function HomeScreen() {
  const [topAnimes, setTopAnimes] = useState<AnimeSearchResult[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [currentPopularIndex, setCurrentPopularIndex] = useState(0);
  const topScrollViewRef = useRef<ScrollView>(null);
  const popularScrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [editMode, setEditMode] = useState(false);
  const [editedAnime, setEditedAnime] = useState<{
    title: string;
    description: string;
    rating: string;
    genre: string;
  } | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres] = useState([
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror',
    'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Suspense',
    'Esportes', 'Sobrenatural', 'Psicológico', 'Mecha', 'Musical'
  ]);
  const router = useRouter();
  const [featuredSynopsis, setFeaturedSynopsis] = useState<string>('');
  const scrollX = useRef(new Animated.Value(0)).current;
  const [carouselScrollX, setCarouselScrollX] = useState(0);

  useEffect(() => {
    loadAnimes();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (popularAnimes.length > 0) {
      const translateFeaturedSynopsis = async () => {
        try {
          const anime = popularAnimes[0];
          if (anime.synopsis) {
            const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=' + encodeURIComponent(anime.synopsis));
            const data = await response.json();
            setFeaturedSynopsis(data[0][0][0]);
          }
        } catch (err) {
          console.error('Erro ao traduzir sinopse do anime em destaque:', err);
          setFeaturedSynopsis(popularAnimes[0].synopsis || '');
        }
      };
      translateFeaturedSynopsis();
    }
  }, [popularAnimes]);

  const loadAnimes = async () => {
    try {
      setLoading(true);
      const [top, popular] = await Promise.all([
        animeService.getTopAnime(),
        animeService.getPopularAnime()
      ]);
      setTopAnimes(top);
      setPopularAnimes(popular);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar animes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimePress = async (anime: AnimeSearchResult) => {
    try {
      // Traduzir a sinopse
      let translatedSynopsis = anime.synopsis;
      if (anime.synopsis) {
        const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=' + encodeURIComponent(anime.synopsis));
        const data = await response.json();
        translatedSynopsis = data[0][0][0];
      }

      setSelectedAnime(anime);
      const genres = anime.genres?.map(g => g.name) || [];
      setSelectedGenres(genres);
      setEditedAnime({
        title: anime.title,
        description: translatedSynopsis || '',
        rating: anime.score?.toString() || '0',
        genre: genres.join(', '),
      });
      setEditMode(false);
      setModalVisible(true);
    } catch (err) {
      console.error('Erro ao traduzir sinopse:', err);
      // Em caso de erro na tradução, usa a sinopse original
      setSelectedAnime(anime);
      const genres = anime.genres?.map(g => g.name) || [];
      setSelectedGenres(genres);
      setEditedAnime({
        title: anime.title,
        description: anime.synopsis || '',
        rating: anime.score?.toString() || '0',
        genre: genres.join(', '),
      });
      setEditMode(false);
      setModalVisible(true);
    }
  };

  const handleSaveToCollection = async () => {
    if (!selectedAnime || !editedAnime) return;

    try {
      // Se for o anime em destaque, usa a sinopse já traduzida
      let description = editedAnime.description;
      if (selectedAnime === popularAnimes[0]) {
        description = featuredSynopsis || editedAnime.description;
      }

      const anime: Anime = {
        id: Date.now(),
        title: editedAnime.title,
        description: description,
        rating: editedAnime.rating,
        genre: selectedGenres.join(', '),
        imageUrl: selectedAnime.images.jpg.large_image_url || selectedAnime.images.jpg.image_url,
        mal_id: selectedAnime.mal_id,
        isFavorite: false,
        isFeatured: false
      };

      await animeService.saveAnime(anime);
      setModalVisible(false);
      setEditMode(false);
      setEditedAnime(null);
      setSelectedGenres([]);
      
      // Navegar para a tela Meus Animes com parâmetro de atualização
      router.replace({
        pathname: '/my-animes',
        params: { refresh: Date.now() }
      });
    } catch (err) {
      setError('Erro ao adicionar anime à coleção');
      console.error(err);
    }
  };

  const handleScroll = (event: any, type: 'top' | 'popular') => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + theme.spacing.md));
    if (type === 'top') {
      setCurrentTopIndex(index);
    } else {
      setCurrentPopularIndex(index);
    }
  };

  const scrollToIndex = (index: number, type: 'top' | 'popular') => {
    const ref = type === 'top' ? topScrollViewRef : popularScrollViewRef;
    if (ref.current) {
      ref.current.scrollTo({
        x: index * (CARD_WIDTH + theme.spacing.sm),
        animated: true,
      });
      if (type === 'top') setCurrentTopIndex(index);
      else setCurrentPopularIndex(index);
    }
  };

  const handlePrev = (type: 'top' | 'popular') => {
    const currentIndex = type === 'top' ? currentTopIndex : currentPopularIndex;
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1, type);
    }
  };

  const handleNext = (type: 'top' | 'popular') => {
    const currentIndex = type === 'top' ? currentTopIndex : currentPopularIndex;
    const animes = type === 'top' ? topAnimes : popularAnimes;
    if (currentIndex < animes.length - 1) {
      scrollToIndex(currentIndex + 1, type);
    }
  };

  if (loading && topAnimes.length === 0) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && topAnimes.length === 0) {
    return (
      <View style={[globalStyles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderFeaturedAnime = (anime: AnimeSearchResult) => {
    return (
      <View style={styles.featuredContainer}>
        <Image
          source={{ uri: anime.images.jpg.large_image_url || anime.images.jpg.image_url }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredGradient}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredInfo}>
              <Title style={styles.featuredTitle} numberOfLines={2}>
                {anime.title}
              </Title>
              <View style={styles.featuredDetails}>
                <Text style={styles.featuredRating}>⭐ {anime.score}</Text>
                <Text style={styles.featuredGenres} numberOfLines={1}>
                  {anime.genres.map(g => g.name).join(' • ')}
                </Text>
              </View>
              <Paragraph style={styles.featuredSynopsis} numberOfLines={2}>
                {featuredSynopsis || anime.synopsis}
              </Paragraph>
            </View>
            <View style={styles.featuredActions}>
              <Button
                mode="contained"
                onPress={() => handleAnimePress(anime)}
                style={styles.featuredButton}
              >
                Ver Detalhes
              </Button>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCarousel = (title: string, animes: AnimeSearchResult[], type: 'top' | 'popular') => {
    const currentIndex = type === 'top' ? currentTopIndex : currentPopularIndex;
    const scrollViewRef = type === 'top' ? topScrollViewRef : popularScrollViewRef;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        
        <View style={styles.carouselContainer}>
          <IconButton
            icon="chevron-left"
            size={32}
            onPress={() => handlePrev(type)}
            style={[styles.navButton, styles.leftButton]}
            containerColor="#fff"
            disabled={currentIndex === 0}
          />
          <Animated.ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={CARD_WIDTH + theme.spacing.sm}
            decelerationRate="fast"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              {
                useNativeDriver: true,
                listener: (e: any) => setCarouselScrollX(e.nativeEvent.contentOffset.x),
              }
            )}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: 'center', paddingVertical: 0, paddingRight: 48 }}
            style={{ flexGrow: 0 }}
          >
            {animes.map((anime, index) => {
              // Calcula escala para o card ativo
              const inputRange = [
                (index - 1) * (CARD_WIDTH + theme.spacing.sm),
                index * (CARD_WIDTH + theme.spacing.sm),
                (index + 1) * (CARD_WIDTH + theme.spacing.sm),
              ];
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.96, 1, 0.96],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View key={anime.mal_id} style={{ transform: [{ scale }], width: CARD_WIDTH, marginHorizontal: 2 }}>
                  <Card
                    style={styles.animeCard}
                    onPress={() => handleAnimePress(anime)}
                  >
                    <Image
                      source={{ uri: anime.images.jpg.large_image_url || anime.images.jpg.image_url }}
                      style={styles.cardImage}
                    />
                    <View style={styles.animeInfo}>
                      <Title style={styles.animeTitle} numberOfLines={2}>
                        {anime.title}
                      </Title>
                      <Text style={styles.animeRating}>
                        ⭐ {anime.score}
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              );
            })}
          </Animated.ScrollView>
          <IconButton
            icon="chevron-right"
            size={32}
            onPress={() => handleNext(type)}
            style={[styles.navButton, styles.rightButton]}
            containerColor="#fff"
            disabled={currentIndex === animes.length - 1}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {popularAnimes.length > 0 && renderFeaturedAnime(popularAnimes[0])}
        {renderCarousel('Os mais vistos da semana', popularAnimes, 'popular')}
        {renderCarousel('Os mais avaliados', topAnimes, 'top')}
      </Animated.View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setEditMode(false);
            setEditedAnime(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedAnime && editedAnime && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalWrapper}>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedAnime.images.jpg.large_image_url || selectedAnime.images.jpg.image_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <IconButton
                    icon="close"
                    iconColor={theme.colors.surface}
                    size={28}
                    onPress={() => {
                      setModalVisible(false);
                      setEditMode(false);
                      setEditedAnime(null);
                    }}
                    style={styles.closeButton}
                  />
                </View>
                <View style={styles.modalContent}>
                  <Title style={styles.modalTitle}>{editedAnime.title}</Title>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalScore}>⭐ {editedAnime.rating}</Text>
                    <Text style={styles.modalGenres}>{editedAnime.genre}</Text>
                  </View>
                  <View style={styles.modalDescription}>
                    <Text style={styles.modalDescriptionTitle}>Sinopse</Text>
                    <Text style={styles.modalDescriptionText}>{editedAnime.description}</Text>
                  </View>
                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setModalVisible(false)}
                      style={styles.modalActionButton}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSaveToCollection}
                      style={styles.modalActionButton}
                    >
                      Salvar
                    </Button>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  featuredContainer: {
    width: FEATURED_WIDTH,
    height: FEATURED_HEIGHT,
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
  },
  featuredInfo: {
    marginBottom: theme.spacing.md,
  },
  featuredTitle: {
    color: theme.colors.surface,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  featuredDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featuredRating: {
    color: theme.colors.surface,
    marginRight: theme.spacing.md,
    fontSize: 16,
  },
  featuredGenres: {
    color: theme.colors.surface,
    opacity: 0.9,
    fontSize: 14,
    flex: 1,
  },
  featuredSynopsis: {
    color: theme.colors.surface,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
  },
  featuredActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  featuredButton: {
    marginRight: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 20,
  },
  animeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginHorizontal: 2,
    backgroundColor: theme.colors.card,
    elevation: 3,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
  },
  animeInfo: {
    padding: theme.spacing.xs,
    height: 60,
  },
  animeTitle: {
    ...theme.typography.subtitle,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
    height: 32,
  },
  animeRating: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.primary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: theme.colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    margin: 16,
    padding: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalScroll: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
  },
  modalImageContainer: {
    position: 'relative',
    height: 220,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 2,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalScore: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalGenres: {
    color: theme.colors.text,
    fontSize: 14,
    marginLeft: 8,
  },
  modalDescription: {
    marginBottom: 20,
  },
  modalDescriptionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.primary,
  },
  modalDescriptionText: {
    color: theme.colors.text,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  editContainer: {
    flex: 1,
  },
  editSection: {
    marginBottom: theme.spacing.lg,
  },
  editSectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  genreChip: {
    margin: 2,
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    paddingVertical: 0,
  },
  navButton: {
    elevation: 4,
    marginHorizontal: theme.spacing.xs,
    zIndex: 2,
    borderRadius: 50,
  },
  leftButton: {
    marginLeft: theme.spacing.md,
  },
  rightButton: {
    marginRight: theme.spacing.md,
  },
});
