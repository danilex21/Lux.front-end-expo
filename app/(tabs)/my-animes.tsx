import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Animated, Image, ImageBackground, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, IconButton, Modal, Portal, Snackbar, Text, TextInput, Title } from 'react-native-paper';
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
  const [genreModalVisible, setGenreModalVisible] = useState(false);
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
          <Card key={anime.id} style={styles.animeCard} onPress={() => handleAnimePress(anime)}>
            <ImageBackground
              source={{ uri: anime.imageUrl }}
              style={styles.cardImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.cardOverlay} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{anime.title}</Text>
                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardScore}>⭐ {anime.rating}</Text>
                  <Text style={styles.cardGenres}>{anime.genre}</Text>
                </View>
              </View>
            </ImageBackground>
          </Card>
        ))}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            borderRadius: 18,
            margin: 16,
            padding: 0,
            elevation: 0,
            overflow: 'hidden',
          }}
        >
          {selectedAnime && (
            <View>
              <View style={{ width: '100%', height: 200, position: 'relative' }}>
                <Image
                  source={{ uri: selectedAnime.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setModalVisible(false)}
                  style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)' }}
                  iconColor="#fff"
                />
              </View>
              <View style={{ alignItems: 'center', padding: 24 }}>
                <Title style={{ fontSize: 20, marginBottom: 8 }}>{selectedAnime.title}</Title>
                <Text style={{ color: '#FFD700', fontWeight: 'bold', marginBottom: 4 }}>⭐ {selectedAnime.rating}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 13, marginBottom: 12 }}>{selectedAnime.genre}</Text>
                <Text style={{ color: theme.colors.text, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
                  {selectedAnime.description}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                  <Button mode="outlined" onPress={() => handleEdit(selectedAnime)}>Editar</Button>
                  <Button mode="contained" onPress={() => handleDelete(selectedAnime.id)} style={{ backgroundColor: theme.colors.error }}>Excluir</Button>
                </View>
              </View>
            </View>
          )}
        </Modal>

        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            borderRadius: 18,
            margin: 16,
            padding: 0,
            elevation: 0,
            overflow: 'hidden',
          }}
        >
          {editingAnime && (
            <View>
              <View style={{ width: '100%', height: 200, position: 'relative' }}>
                <Image
                  source={{ uri: editingAnime.imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <IconButton
                  icon="close"
                  size={24}
                  onPress={() => setEditModalVisible(false)}
                  style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.3)' }}
                  iconColor="#fff"
                />
              </View>
              <View style={{ alignItems: 'center', padding: 24 }}>
                <Title style={{ fontSize: 20, marginBottom: 12 }}>Editar Anime</Title>
                <TextInput
                  label="Título"
                  value={editingAnime.title}
                  onChangeText={(text) => setEditingAnime({ ...editingAnime, title: text })}
                  style={{ width: '100%', marginBottom: 12 }}
                  mode="outlined"
                />
                <TextInput
                  label="Descrição"
                  value={editingAnime.description}
                  onChangeText={(text) => setEditingAnime({ ...editingAnime, description: text })}
                  multiline
                  numberOfLines={4}
                  style={{ width: '100%', marginBottom: 12 }}
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
                  style={{ width: '100%', marginBottom: 12 }}
                  mode="outlined"
                />
                <Button
                  mode="outlined"
                  onPress={() => setGenreModalVisible(true)}
                  style={{ width: '100%', marginBottom: 12 }}
                >
                  Selecionar Gêneros
                </Button>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16, justifyContent: 'center' }}>
                  {selectedGenres.map((genre) => (
                    <Chip key={genre} style={{ margin: 2 }}>{genre}</Chip>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                  <Button mode="outlined" onPress={() => setEditModalVisible(false)}>Cancelar</Button>
                  <Button mode="contained" onPress={handleSaveEdit}>Salvar</Button>
                </View>
              </View>
            </View>
          )}
        </Modal>

        <Modal
          visible={genreModalVisible}
          onDismiss={() => setGenreModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.background,
            borderRadius: 18,
            margin: 32,
            padding: 24,
            elevation: 4,
            alignItems: 'center',
          }}
        >
          <Title style={{ fontSize: 18, marginBottom: 16 }}>Selecione os Gêneros</Title>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
            {['Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia', 'Horror', 'Mistério', 'Romance', 'Sci-Fi', 'Slice of Life', 'Suspense', 'Esportes', 'Sobrenatural', 'Psicológico', 'Mecha', 'Musical'].map((genre) => (
              <Chip
                key={genre}
                selected={selectedGenres.includes(genre)}
                onPress={() => toggleGenre(genre)}
                style={{ margin: 4 }}
                mode={selectedGenres.includes(genre) ? 'flat' : 'outlined'}
              >
                {genre}
              </Chip>
            ))}
          </View>
          <Button mode="contained" onPress={() => setGenreModalVisible(false)} style={{ width: '100%' }}>Confirmar</Button>
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
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
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
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(36, 35, 35, 0.55)',
    borderRadius: 16,
  },
  cardContent: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(36, 34, 34, 0.55)',
    borderBottomLeftRadius: 16,
    borderTopRightRadius: 12,
    maxWidth: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    flexShrink: 0,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cardScore: {
    color: '#FFD700',
    fontWeight: 'bold',
    marginRight: 4,
    fontSize: 14,
  },
  cardGenres: {
    color: '#fff',
    fontSize: 12,
    flexShrink: 1,
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