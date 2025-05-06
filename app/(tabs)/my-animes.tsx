import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, IconButton, Modal, Paragraph, Portal, Snackbar, Switch, Text, TextInput, Title } from 'react-native-paper';
import { styles as globalStyles, theme } from '../../constants/theme';
import { animeService } from '../../services/animeService';
import { Anime } from '../../types/anime';

export default function MyAnimesScreen() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAnimeId, setDeletingAnimeId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const params = useLocalSearchParams();

  useEffect(() => {
    loadAnimes();
  }, [params.refresh]);

  useEffect(() => {
    if (editingAnime) {
      setSelectedGenres(editingAnime.genre.split(', '));
    }
  }, [editingAnime]);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };

  const loadAnimes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await animeService.getAnimes();
      setAnimes(data);
    } catch (err) {
      setError('Erro ao carregar animes');
      showSnackbar('Erro ao carregar animes', 'error');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAnimePress = (anime: Anime) => {
    setSelectedAnime(anime);
    setModalVisible(true);
  };

  const handleEdit = (anime: Anime) => {
    setEditingAnime(anime);
    setEditModalVisible(true);
    setModalVisible(false);
  };

  const handleSaveEdit = async () => {
    if (!editingAnime) return;

    try {
      setLoading(true);
      const updatedAnime = {
        ...editingAnime,
        genre: selectedGenres.join(', ')
      };
      await animeService.updateAnime(updatedAnime);
      await loadAnimes();
      setEditModalVisible(false);
      setEditingAnime(null);
      setSelectedGenres([]);
      showSnackbar('Anime atualizado com sucesso!', 'success');
    } catch (err) {
      setError('Erro ao editar anime');
      showSnackbar('Erro ao editar anime', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setModalVisible(false);
      setDeletingAnimeId(id);
      await animeService.deleteAnime(id);
      setAnimes(animes.filter(anime => anime.id !== id));
      showSnackbar('Anime excluído com sucesso!', 'success');
    } catch (err) {
      setError('Erro ao excluir anime');
      showSnackbar('Erro ao excluir anime', 'error');
      console.error(err);
    } finally {
      setDeletingAnimeId(null);
    }
  };

  const handleToggleFavorite = async (anime: Anime) => {
    try {
      setLoading(true);
      const updatedAnime = { ...anime, isFavorite: !anime.isFavorite };
      await animeService.updateAnime(updatedAnime);
      setAnimes(animes.map(a => a.id === anime.id ? updatedAnime : a));
      showSnackbar(
        updatedAnime.isFavorite ? 'Anime adicionado aos favoritos!' : 'Anime removido dos favoritos!',
        'success'
      );
    } catch (err) {
      setError('Erro ao atualizar anime');
      showSnackbar('Erro ao atualizar anime', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (anime: Anime) => {
    try {
      setLoading(true);
      const updatedAnime = {
        ...anime,
        isFeatured: !anime.isFeatured,
      };
      await animeService.updateAnime(updatedAnime);
      await loadAnimes();
    } catch (err) {
      setError('Erro ao atualizar destaque');
      showSnackbar('Erro ao atualizar destaque', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimes = animes.filter(anime => {
    if (showFavoritesOnly) return anime.isFavorite;
    if (showFeaturedOnly) return anime.isFeatured;
    return true;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadAnimes();
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error && animes.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadAnimes}>
          Tentar Novamente
        </Button>
      </View>
    );
  }

  return (
    <Animated.View style={[globalStyles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>Meus Animes</Text>
        <View style={styles.headerButtons}>
          <Text style={styles.filterCount}>
            {showFavoritesOnly 
              ? `${animes.filter(anime => anime.isFavorite).length} favoritos`
              : showFeaturedOnly
                ? `${animes.filter(anime => anime.isFeatured).length} em destaque`
                : `${animes.length} animes`
            }
          </Text>
          <IconButton
            icon={showFeaturedOnly ? 'star' : 'star-outline'}
            iconColor={showFeaturedOnly ? theme.colors.primary : theme.colors.text}
            size={24}
            onPress={() => {
              setShowFeaturedOnly(!showFeaturedOnly);
              setShowFavoritesOnly(false);
            }}
          />
          <IconButton
            icon={showFavoritesOnly ? 'heart' : 'heart-outline'}
            iconColor={showFavoritesOnly ? theme.colors.primary : theme.colors.text}
            size={24}
            onPress={() => {
              setShowFavoritesOnly(!showFavoritesOnly);
              setShowFeaturedOnly(false);
            }}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {filteredAnimes.map((anime) => (
          <Card
            key={anime.id}
            style={[
              styles.animeCard,
              anime.isFeatured && styles.featuredCard
            ]}
            onPress={() => handleAnimePress(anime)}
          >
            <View style={styles.cardContent}>
              <Image
                source={{ uri: anime.image }}
                style={styles.animeImage}
              />
              <View style={styles.animeInfo}>
                <View style={styles.titleContainer}>
                  <Title style={styles.animeTitle} numberOfLines={2}>
                    {anime.title}
                  </Title>
                  <View style={styles.cardButtons}>
                    <IconButton
                      icon={anime.isFeatured ? 'star' : 'star-outline'}
                      iconColor={anime.isFeatured ? theme.colors.primary : theme.colors.text}
                      size={20}
                      onPress={() => handleToggleFeatured(anime)}
                    />
                    <IconButton
                      icon={anime.isFavorite ? 'heart' : 'heart-outline'}
                      iconColor={anime.isFavorite ? theme.colors.primary : theme.colors.text}
                      size={20}
                      onPress={() => handleToggleFavorite(anime)}
                    />
                  </View>
                </View>
                <Paragraph style={styles.animeRating}>
                  Nota: {anime.rating}
                </Paragraph>
                <Paragraph style={styles.animeGenre} numberOfLines={1}>
                  {anime.genre}
                </Paragraph>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedAnime && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalWrapper}>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: selectedAnime.image }}
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
                    <View style={styles.modalOverlayButtons}>
                      <IconButton
                        icon={selectedAnime.isFeatured ? 'star' : 'star-outline'}
                        iconColor={selectedAnime.isFeatured ? theme.colors.primary : theme.colors.surface}
                        size={24}
                        onPress={() => handleToggleFeatured(selectedAnime)}
                        style={styles.overlayButton}
                      />
                      <IconButton
                        icon={selectedAnime.isFavorite ? 'heart' : 'heart-outline'}
                        iconColor={selectedAnime.isFavorite ? theme.colors.primary : theme.colors.surface}
                        size={24}
                        onPress={() => handleToggleFavorite(selectedAnime)}
                        style={styles.overlayButton}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>{selectedAnime.title}</Text>
                  
                  <View style={styles.modalInfoContainer}>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Nota</Text>
                      <Text style={styles.modalInfoValue}>{selectedAnime.rating}</Text>
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Gênero</Text>
                      <Text style={styles.modalInfoValue} numberOfLines={1}>
                        {selectedAnime.genre}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalDescription}>
                    <Text style={styles.modalDescriptionTitle}>Sinopse</Text>
                    <Text style={styles.modalDescriptionText}>
                      {selectedAnime.description}
                    </Text>
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => handleEdit(selectedAnime)}
                      style={styles.modalActionButton}
                      icon="pencil"
                    >
                      Editar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleDelete(selectedAnime.id)}
                      style={[styles.modalActionButton, { backgroundColor: theme.colors.error }]}
                      icon="delete"
                      loading={deletingAnimeId === selectedAnime.id}
                      disabled={deletingAnimeId === selectedAnime.id}
                    >
                      Excluir
                    </Button>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </Modal>

        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {editingAnime && (
            <ScrollView style={styles.modalScroll}>
              <View style={styles.modalWrapper}>
                <View style={styles.modalImageContainer}>
                  <Image
                    source={{ uri: editingAnime.image }}
                    style={styles.modalImage}
                    resizeMode="cover"
                  />
                  <View style={styles.modalOverlay}>
                    <IconButton
                      icon="close"
                      iconColor={theme.colors.surface}
                      size={24}
                      onPress={() => setEditModalVisible(false)}
                      style={styles.closeButton}
                    />
                  </View>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Editar Anime</Text>
                  
                  <TextInput
                    label="Título"
                    value={editingAnime.title}
                    onChangeText={(text) => setEditingAnime({ ...editingAnime, title: text })}
                    style={styles.input}
                    mode="outlined"
                  />

                  <TextInput
                    label="Descrição"
                    value={editingAnime.description}
                    onChangeText={(text) => setEditingAnime({ ...editingAnime, description: text })}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    mode="outlined"
                  />

                  <TextInput
                    label="Nota (0-10)"
                    value={editingAnime.rating}
                    onChangeText={(text) => {
                      const num = parseFloat(text);
                      if (!isNaN(num) && num >= 0 && num <= 10) {
                        setEditingAnime({ ...editingAnime, rating: text });
                      }
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                  />

                  <View style={styles.genreContainer}>
                    <Text style={styles.genreLabel}>Gêneros</Text>
                    <View style={styles.genreChips}>
                      {['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life'].map((genre) => (
                        <Chip
                          key={genre}
                          selected={selectedGenres.includes(genre)}
                          onPress={() => toggleGenre(genre)}
                          style={[
                            styles.genreChip,
                            selectedGenres.includes(genre) && styles.selectedGenreChip
                          ]}
                          textStyle={[
                            styles.genreChipText,
                            selectedGenres.includes(genre) && styles.selectedGenreChipText
                          ]}
                        >
                          {genre}
                        </Chip>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalInfoContainer}>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Favorito</Text>
                      <Switch
                        value={editingAnime.isFavorite}
                        onValueChange={(value) => setEditingAnime({ ...editingAnime, isFavorite: value })}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.modalInfoItem}>
                      <Text style={styles.modalInfoLabel}>Destaque</Text>
                      <Switch
                        value={editingAnime.isFeatured}
                        onValueChange={(value) => setEditingAnime({ ...editingAnime, isFeatured: value })}
                        color={theme.colors.primary}
                      />
                    </View>
                  </View>

                  <View style={styles.modalActions}>
                    <Button
                      mode="outlined"
                      onPress={() => setEditModalVisible(false)}
                      style={styles.modalActionButton}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      mode="contained"
                      onPress={handleSaveEdit}
                      style={styles.modalActionButton}
                      loading={loading}
                      disabled={loading}
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={[
          styles.snackbar,
          { backgroundColor: snackbarType === 'success' ? theme.colors.primary : theme.colors.error }
        ]}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    elevation: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterCount: {
    ...theme.typography.caption,
    marginRight: theme.spacing.sm,
  },
  animeCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
  },
  animeImage: {
    width: 100,
    height: 150,
    borderRadius: theme.borderRadius.sm,
  },
  animeInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  animeTitle: {
    flex: 1,
    marginRight: theme.spacing.sm,
    ...theme.typography.subtitle,
  },
  animeRating: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  animeGenre: {
    ...theme.typography.caption,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -theme.borderRadius.xl,
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  button: {
    marginTop: theme.spacing.md,
  },
  favoriteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  favoriteLabel: {
    ...theme.typography.text,
  },
  cardButtons: {
    flexDirection: 'row',
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  modalOverlayButtons: {
    flexDirection: 'row',
  },
  overlayButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginLeft: theme.spacing.sm,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
  },
  retryButton: {
    marginTop: theme.spacing.md,
  },
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  genreContainer: {
    marginBottom: theme.spacing.lg,
  },
  genreLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  genreChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  genreChip: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  selectedGenreChip: {
    backgroundColor: theme.colors.primary,
  },
  genreChipText: {
    color: theme.colors.primary,
  },
  selectedGenreChipText: {
    color: theme.colors.surface,
  },
}); 