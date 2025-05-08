import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, IconButton, Modal, Paragraph, Portal, Text, Title } from 'react-native-paper';
import { styles as globalStyles, theme } from '../../constants/theme';
import { animeService } from '../../services/animeService';
import { Anime, AnimeSearchResult } from '../../types/anime';

const { width } = Dimensions.get('window');
const FEATURED_WIDTH = width;
const FEATURED_HEIGHT = width * 0.5;
const CARD_WIDTH = width * 0.3;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

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

  const handleAnimePress = (anime: AnimeSearchResult) => {
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
  };

  const handleSaveToCollection = async () => {
    if (!selectedAnime || !editedAnime) return;

    try {
      const anime: Anime = {
        id: Date.now(),
        title: editedAnime.title,
        description: editedAnime.description,
        rating: editedAnime.rating,
        genre: selectedGenres.join(', '),
        image: selectedAnime.images.jpg.image_url,
        mal_id: selectedAnime.mal_id,
      };

      await animeService.saveAnime(anime);
      setModalVisible(false);
      setEditMode(false);
      setEditedAnime(null);
      setSelectedGenres([]);
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
        x: index * (CARD_WIDTH + theme.spacing.md),
        animated: true,
      });
    }
  };

  const handlePrev = (type: 'top' | 'popular') => {
    const currentIndex = type === 'top' ? currentTopIndex : currentPopularIndex;
    const animes = type === 'top' ? topAnimes : popularAnimes;
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
                {anime.synopsis}
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
            disabled={currentIndex === 0}
          />
          
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            pagingEnabled
            snapToInterval={CARD_WIDTH + theme.spacing.sm}
            decelerationRate="fast"
            onScroll={(e) => handleScroll(e, type)}
            scrollEventThrottle={16}
          >
            {animes.map((anime) => (
              <Card
                key={anime.mal_id}
                style={styles.animeCard}
                onPress={() => handleAnimePress(anime)}
              >
                <Image
                  source={{ uri: anime.images.jpg.image_url }}
                  style={styles.animeImage}
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
            ))}
          </ScrollView>

          <IconButton
            icon="chevron-right"
            size={32}
            onPress={() => handleNext(type)}
            style={[styles.navButton, styles.rightButton]}
            disabled={currentIndex === animes.length - 1}
          />
        </View>

        <View style={styles.pagination}>
          {animes.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
            />
          ))}
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
                    source={{ uri: selectedAnime.images.jpg.image_url }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalOverlay}>
                    <IconButton
                      icon="close"
                      iconColor={theme.colors.surface}
                      size={24}
                      onPress={() => {
                        setModalVisible(false);
                        setEditMode(false);
                        setEditedAnime(null);
                      }}
                      style={styles.closeButton}
                    />
                  </View>
                </View>

                <View style={styles.modalContent}>
                  {editMode ? (
                    <View style={styles.editContainer}>
                      <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>Informações Básicas</Text>
                        <TextInput
                          label="Título"
                          value={editedAnime.title}
                          onChangeText={(text) => setEditedAnime({ ...editedAnime, title: text })}
                          style={styles.modalInput}
                          mode="outlined"
                          left={<TextInput.Icon icon="format-title" />}
                          outlineColor={theme.colors.primary}
                          activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                          label="Nota"
                          value={editedAnime.rating}
                          onChangeText={(text) => setEditedAnime({ ...editedAnime, rating: text })}
                          keyboardType="numeric"
                          style={styles.modalInput}
                          mode="outlined"
                          left={<TextInput.Icon icon="star" />}
                          outlineColor={theme.colors.primary}
                          activeOutlineColor={theme.colors.primary}
                        />
                      </View>

                      <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>Gêneros</Text>
                        <View style={styles.genresContainer}>
                          {availableGenres.map((genre) => (
                            <Chip
                              key={genre}
                              selected={selectedGenres.includes(genre)}
                              onPress={() => {
                                if (selectedGenres.includes(genre)) {
                                  setSelectedGenres(selectedGenres.filter(g => g !== genre));
                                } else {
                                  setSelectedGenres([...selectedGenres, genre]);
                                }
                              }}
                              style={styles.genreChip}
                              mode="outlined"
                            >
                              {genre}
                            </Chip>
                          ))}
                        </View>
                      </View>

                      <View style={styles.editSection}>
                        <Text style={styles.editSectionTitle}>Sinopse</Text>
                        <TextInput
                          label="Descrição"
                          value={editedAnime.description}
                          onChangeText={(text) => setEditedAnime({ ...editedAnime, description: text })}
                          multiline
                          numberOfLines={6}
                          style={[styles.modalInput, styles.descriptionInput]}
                          mode="outlined"
                          left={<TextInput.Icon icon="text" />}
                          outlineColor={theme.colors.primary}
                          activeOutlineColor={theme.colors.primary}
                        />
                      </View>

                      <View style={styles.modalActions}>
                        <Button
                          mode="outlined"
                          onPress={() => {
                            setEditMode(false);
                            setEditedAnime({
                              title: selectedAnime.title,
                              description: selectedAnime.synopsis || '',
                              rating: selectedAnime.score?.toString() || '0',
                              genre: selectedGenres.join(', '),
                            });
                          }}
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
                  ) : (
                    <>
                      <Title style={styles.modalTitle}>{editedAnime.title}</Title>
                      <View style={styles.modalInfoContainer}>
                        <View style={styles.modalInfoItem}>
                          <Text style={styles.modalInfoLabel}>Nota</Text>
                          <Text style={styles.modalInfoValue}>⭐ {editedAnime.rating}</Text>
                        </View>
                        <View style={styles.modalInfoItem}>
                          <Text style={styles.modalInfoLabel}>Gêneros</Text>
                          <Text style={styles.modalInfoValue}>{editedAnime.genre}</Text>
                        </View>
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
                          onPress={() => setEditMode(true)}
                          style={styles.modalActionButton}
                        >
                          Editar
                        </Button>
                      </View>
                    </>
                  )}
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
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  navButton: {
    backgroundColor: theme.colors.surface,
    elevation: 4,
    marginHorizontal: theme.spacing.sm,
  },
  leftButton: {
    marginLeft: theme.spacing.md,
  },
  rightButton: {
    marginRight: theme.spacing.md,
  },
  horizontalScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  animeCard: {
    width: CARD_WIDTH,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    elevation: 2,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  animeImage: {
    width: '100%',
    height: CARD_HEIGHT,
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
    margin: 0,
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
  },
  modalImageContainer: {
    position: 'relative',
    height: 300,
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.lg,
  },
  modalInfoContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  modalInfoItem: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  modalInfoLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalInfoValue: {
    ...theme.typography.text,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalDescription: {
    marginBottom: theme.spacing.lg,
  },
  modalDescriptionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  modalDescriptionText: {
    ...theme.typography.text,
    lineHeight: 24,
    color: theme.colors.text,
  },
  modalInput: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
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
});
