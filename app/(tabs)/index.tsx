import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, Modal, Paragraph, Portal, Text, Title } from 'react-native-paper';
import { styles as globalStyles, theme } from '../../constants/theme';
import { animeService } from '../../services/animeService';
import { Anime, AnimeSearchResult } from '../../types/anime';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4; // Reduzido para 40% da largura da tela
const CARD_HEIGHT = CARD_WIDTH * 1.4;

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
    setModalVisible(true);
  };

  const handleAddToCollection = async () => {
    if (!selectedAnime) return;

    try {
      const anime: Anime = {
        id: Date.now(),
        title: selectedAnime.title,
        description: selectedAnime.synopsis,
        rating: selectedAnime.score.toString(),
        genre: selectedAnime.genres.map(g => g.name).join(', '),
        image: selectedAnime.images.jpg.image_url,
        mal_id: selectedAnime.mal_id,
      };

      await animeService.saveAnime(anime);
      setModalVisible(false);
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
            snapToInterval={CARD_WIDTH + theme.spacing.md}
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
                  <Paragraph style={styles.animeRating}>
                    Nota: {anime.score}
                  </Paragraph>
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
        {renderCarousel('Os mais vistos da semana', popularAnimes, 'popular')}
        {renderCarousel('Os mais avaliados', topAnimes, 'top')}
      </Animated.View>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedAnime && (
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
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  />
                </View>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalTitle}>{selectedAnime.title}</Text>
                
                <View style={styles.modalInfoContainer}>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Nota</Text>
                    <Text style={styles.modalInfoValue}>{selectedAnime.score}</Text>
                  </View>
                  <View style={styles.modalInfoItem}>
                    <Text style={styles.modalInfoLabel}>Gêneros</Text>
                    <Text style={styles.modalInfoValue} numberOfLines={1}>
                      {selectedAnime.genres.map(g => g.name).join(', ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalDescription}>
                  <Text style={styles.modalDescriptionTitle}>Sinopse</Text>
                  <Text style={styles.modalDescriptionText}>
                    {selectedAnime.synopsis}
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={handleAddToCollection}
                  style={styles.addButton}
                  icon="plus"
                >
                  Adicionar à Coleção
                </Button>
              </ScrollView>
            </View>
          )}
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: theme.spacing.lg,
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
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.card,
    elevation: 2,
    borderRadius: theme.borderRadius.md,
  },
  animeImage: {
    width: '100%',
    height: CARD_HEIGHT,
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  animeInfo: {
    padding: theme.spacing.sm,
  },
  animeTitle: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginBottom: theme.spacing.xs,
  },
  animeRating: {
    ...theme.typography.caption,
    fontSize: 12,
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
  modalWrapper: {
    flex: 1,
  },
  modalImageContainer: {
    position: 'relative',
    height: 400,
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
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -theme.borderRadius.xl,
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
  addButton: {
    marginTop: theme.spacing.md,
  },
});
