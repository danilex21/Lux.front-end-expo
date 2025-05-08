import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
<<<<<<< HEAD
import { Alert, Animated, Image, ScrollView, StyleSheet, View } from 'react-native';
=======
import { Animated, Image, ScrollView, StyleSheet, View } from 'react-native';
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
import { ActivityIndicator, Button, Card, Chip, IconButton, Modal, Portal, Searchbar, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { styles as globalStyles, theme } from '../../constants/theme';
import { animeService } from '../../services/animeService';
import { Anime, AnimeSearchResult } from '../../types/anime';

const GENRES = [
  { name: 'Ação', color: '#FF5252' },
  { name: 'Aventura', color: '#FF9800' },
  { name: 'Comédia', color: '#FFEB3B' },
  { name: 'Drama', color: '#4CAF50' },
  { name: 'Fantasia', color: '#9C27B0' },
  { name: 'Horror', color: '#795548' },
  { name: 'Mistério', color: '#607D8B' },
  { name: 'Romance', color: '#E91E63' },
  { name: 'Sci-Fi', color: '#00BCD4' },
  { name: 'Slice of Life', color: '#8BC34A' },
  { name: 'Suspense', color: '#3F51B5' },
  { name: 'Terror', color: '#212121' },
];

export default function AddAnimeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animeData, setAnimeData] = useState<Omit<Anime, 'id'>>({
    title: '',
    description: '',
    rating: '',
    genre: '',
<<<<<<< HEAD
    imageUrl: '',
=======
    image: '',
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
    isFavorite: false,
    mal_id: 0,
  });
  const [selectedAnime, setSelectedAnime] = useState<AnimeSearchResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [genreModalVisible, setGenreModalVisible] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<'success' | 'error'>('success');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const showSnackbar = useCallback((message: string, type: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  }, []);

  const translateText = async (text: string): Promise<string> => {
    if (!text) return '';
    
    try {
      const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=' + encodeURIComponent(text));
      
      if (!response.ok) {
        throw new Error('Erro na tradução');
      }

      const data = await response.json();
      return data[0][0][0] || text;
    } catch (error) {
      console.error('Erro na tradução:', error);
      return text;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const results = await animeService.searchAnime(searchQuery);

      const uniqueResults = results.filter((anime, index, self) =>
        index === self.findIndex((a) => a.mal_id === anime.mal_id)
      );

      setSearchResults(uniqueResults);
      if (uniqueResults.length === 0) {
        showSnackbar('Nenhum anime encontrado', 'error');
      }
    } catch (err) {
      setError('Erro ao buscar animes');
      showSnackbar('Erro ao buscar animes', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const handleAnimeSelect = async (anime: AnimeSearchResult) => {
    try {
      // Traduzir a sinopse
      let translatedSynopsis = anime.synopsis;
      if (anime.synopsis) {
        const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pt&dt=t&q=' + encodeURIComponent(anime.synopsis));
        const data = await response.json();
        translatedSynopsis = data[0][0][0];
      }

      setSelectedAnime({
        ...anime,
        synopsis: translatedSynopsis
      });
      setModalVisible(true);
    } catch (err) {
      console.error('Erro ao traduzir sinopse:', err);
      // Em caso de erro na tradução, usa a sinopse original
      setSelectedAnime(anime);
      setModalVisible(true);
    }
  };

  const handleConfirmSelection = async () => {
    if (!selectedAnime) return;

    try {
      setLoading(true);
      const existingAnimes = await animeService.getAnimes();
      const isDuplicate = existingAnimes.some(anime => anime.mal_id === selectedAnime.mal_id);

      if (isDuplicate) {
        Alert.alert('Erro', 'Este anime já está na sua coleção!');
        return;
      }

      const animeData: Anime = {
        id: Date.now(),
        title: selectedAnime.title,
        description: selectedAnime.synopsis || '',
        rating: selectedAnime.score?.toString() || '0',
        genre: selectedAnime.genres?.map(g => g.name).join(', ') || '',
        imageUrl: selectedAnime.images?.jpg?.large_image_url || selectedAnime.images?.jpg?.image_url || 'https://via.placeholder.com/150',
        mal_id: selectedAnime.mal_id,
        isFavorite: false,
        isFeatured: false
      };

      await animeService.saveAnime(animeData);
      setModalVisible(false);
      setSelectedAnime(null);
      setSearchQuery('');
      setSearchResults([]);
      
      // Navegar para a tela Meus Animes com parâmetro de atualização
=======
  const handleSelectAnime = useCallback((anime: AnimeSearchResult) => {
    setSelectedAnime(anime);
    setModalVisible(true);
  }, []);

  const handleConfirmSelection = async () => {
    if (!selectedAnime) return;
    
    try {
      setLoading(true);
      setError(null);
      setModalVisible(false);

      const existingAnimes = await animeService.getAnimes();
      const animeExists = existingAnimes.some(anime => anime.mal_id === selectedAnime.mal_id);

      if (animeExists) {
        showSnackbar('Este anime já está na sua coleção!', 'error');
        setSelectedAnime(null);
        setLoading(false);
        return;
      }

      const translatedDescription = await translateText(selectedAnime.synopsis || '');
      
      const animeData: Omit<Anime, 'id'> = {
        title: selectedAnime.title,
        description: translatedDescription.substring(0, 500),
        rating: selectedAnime.score?.toString() || '0',
        genre: selectedAnime.genres?.map(g => g.name).join(', ') || '',
        image: selectedAnime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400',
        isFavorite: false,
        mal_id: selectedAnime.mal_id,
      };

      await animeService.saveAnime(animeData as Anime);
      setSelectedAnime(null);
      setSearchResults([]);
      setSearchQuery('');
      showSnackbar('Anime adicionado com sucesso!', 'success');
      
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
      router.replace({
        pathname: '/my-animes',
        params: { refresh: Date.now() }
      });
    } catch (err) {
<<<<<<< HEAD
      console.error('Erro ao salvar anime:', err);
      Alert.alert('Erro', 'Não foi possível salvar o anime. Tente novamente.');
=======
      setError('Erro ao salvar anime');
      showSnackbar('Erro ao salvar anime', 'error');
      console.error(err);
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!animeData.title || !animeData.description || !animeData.rating || selectedGenres.length === 0) {
      showSnackbar('Por favor, preencha todos os campos', 'error');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setShowForm(false);

      const rating = parseFloat(animeData.rating);
      if (isNaN(rating) || rating < 0 || rating > 10) {
        setError('A nota deve estar entre 0 e 10');
        showSnackbar('A nota deve estar entre 0 e 10', 'error');
        return;
      }

      const anime: Anime = {
        id: Date.now(),
        title: animeData.title,
        description: animeData.description,
        rating: rating.toString(),
        genre: selectedGenres.join(', '),
<<<<<<< HEAD
        imageUrl: selectedImage || 'https://via.placeholder.com/300x400',
=======
        image: selectedImage || 'https://via.placeholder.com/300x400',
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
        isFavorite: animeData.isFavorite,
        isFeatured: false,
      };

      await animeService.saveAnime(anime);
      setAnimeData({
        title: '',
        description: '',
        rating: '',
        genre: '',
<<<<<<< HEAD
        imageUrl: '',
=======
        image: '',
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
        isFavorite: false,
        mal_id: 0,
      });
      setSearchQuery('');
      setSelectedImage(null);
      setSelectedGenres([]);
      showSnackbar('Anime adicionado com sucesso!', 'success');
      
      router.replace({
        pathname: '/my-animes',
        params: { refresh: Date.now() }
      });
    } catch (err) {
      setError('Erro ao salvar anime');
      showSnackbar('Erro ao salvar anime', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreSelect = useCallback((genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  const handleGenreConfirm = useCallback(() => {
    setAnimeData(prev => ({
      ...prev,
      genre: selectedGenres.join(', ')
    }));
    setGenreModalVisible(false);
  }, [selectedGenres]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        setAnimeData(prev => ({
          ...prev,
<<<<<<< HEAD
          imageUrl: result.assets[0].uri
=======
          image: result.assets[0].uri
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
        }));
      }
    } catch (err) {
      setError('Erro ao selecionar imagem');
      console.error(err);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <View style={globalStyles.container}>
      <ScrollView>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <Text style={globalStyles.title}>Adicionar Anime</Text>
          
          <Searchbar
            placeholder="Pesquisar anime..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
          />

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {searchResults.length > 0 && !showForm && (
            <View style={styles.resultsContainer}>
              {searchResults.map((anime, index) => (
                <Card
                  key={`${anime.mal_id}-${index}`}
                  style={styles.resultCard}
<<<<<<< HEAD
                  onPress={() => handleAnimeSelect(anime)}
=======
                  onPress={() => handleSelectAnime(anime)}
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
                >
                  <Card.Content style={styles.resultCardContent}>
                    <Image
                      source={{ uri: anime.images?.jpg?.image_url || 'https://via.placeholder.com/300x400' }}
                      style={styles.animeImage}
                    />
                    <View style={styles.animeInfo}>
                      <Text style={styles.animeTitle} numberOfLines={2}>
                        {anime.title}
                      </Text>
                      <Text style={styles.animeScore}>
                        Nota: {anime.score || 'N/A'}
                      </Text>
                      <Text style={styles.animeGenres} numberOfLines={1}>
                        {anime.genres?.map(g => g.name).join(', ') || 'Sem gênero'}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}

          {showForm ? (
            <Card style={styles.formCard}>
              <Card.Content>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Adicionar Anime Manualmente</Text>
                  <IconButton
                    icon="arrow-left"
                    size={24}
                    onPress={() => {
                      setShowForm(false);
                      setAnimeData({
                        title: '',
                        description: '',
                        rating: '',
                        genre: '',
<<<<<<< HEAD
                        imageUrl: '',
=======
                        image: '',
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
                        isFavorite: false,
                        mal_id: 0,
                      });
                      setSelectedImage(null);
                      setSelectedGenres([]);
                    }}
                  />
                </View>

                <View style={styles.imageContainer}>
                  {selectedImage ? (
                    <View style={styles.selectedImageContainer}>
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.selectedImage}
                      />
                      <IconButton
                        icon="close"
                        size={20}
                        style={styles.removeImageButton}
                        onPress={() => {
                          setSelectedImage(null);
<<<<<<< HEAD
                          setAnimeData(prev => ({ ...prev, imageUrl: '' }));
=======
                          setAnimeData(prev => ({ ...prev, image: '' }));
>>>>>>> 458815e72220a8e9989757169d9dff5ead8b7e00
                        }}
                      />
                    </View>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={pickImage}
                      icon="image-plus"
                      style={styles.imageButton}
                    >
                      Selecionar Imagem
                    </Button>
                  )}
                </View>

                <TextInput
                  label="Título"
                  value={animeData.title}
                  onChangeText={(text) => setAnimeData(prev => ({ ...prev, title: text }))}
                  style={styles.input}
                  mode="outlined"
                />

                <TextInput
                  label="Descrição (máx. 500 caracteres)"
                  value={animeData.description}
                  onChangeText={(text) => setAnimeData(prev => ({ ...prev, description: text.substring(0, 500) }))}
                  multiline
                  numberOfLines={4}
                  style={styles.input}
                  mode="outlined"
                  maxLength={500}
                />

                <TextInput
                  label="Nota (0-10)"
                  value={animeData.rating}
                  onChangeText={(text) => {
                    const num = parseFloat(text);
                    if (!isNaN(num) && num >= 0 && num <= 10) {
                      setAnimeData(prev => ({ ...prev, rating: text }));
                    }
                  }}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                />

                <View style={styles.genreContainer}>
                  <Text style={styles.genreLabel}>Gêneros</Text>
                  <View style={styles.genreChips}>
                    {GENRES.map((genre) => (
                      <Chip
                        key={genre.name}
                        selected={selectedGenres.includes(genre.name)}
                        onPress={() => toggleGenre(genre.name)}
                        style={[
                          styles.genreChip,
                          selectedGenres.includes(genre.name) && styles.selectedGenreChip
                        ]}
                        textStyle={[
                          styles.genreChipText,
                          selectedGenres.includes(genre.name) && styles.selectedGenreChipText
                        ]}
                      >
                        {genre.name}
                      </Chip>
                    ))}
                  </View>
                </View>

                <View style={styles.favoriteContainer}>
                  <Text style={styles.favoriteLabel}>Favorito</Text>
                  <Switch
                    value={animeData.isFavorite}
                    onValueChange={(value) => setAnimeData(prev => ({ ...prev, isFavorite: value }))}
                    color={theme.colors.primary}
                  />
                </View>

                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Salvar Anime
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <Button
              mode="contained"
              onPress={() => setShowForm(true)}
              style={styles.button}
            >
              Adicionar Manualmente
            </Button>
          )}
        </Animated.View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        </View>
      )}

      <Portal>
        <Modal
          visible={modalVisible && !loading}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedAnime && (
            <View>
              <Image
                source={{ uri: selectedAnime.images.jpg.image_url }}
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>{selectedAnime.title}</Text>
              <Text style={styles.modalText} numberOfLines={3}>
                {selectedAnime.synopsis}
              </Text>
              <Text style={styles.modalInfo}>
                Nota: {selectedAnime.score}
              </Text>
              <Text style={styles.modalInfo}>
                Gêneros: {selectedAnime.genres.map(g => g.name).join(', ')}
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  mode="outlined"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleConfirmSelection}
                  style={styles.modalButton}
                  loading={loading}
                  disabled={loading}
                >
                  Selecionar
                </Button>
              </View>
            </View>
          )}
        </Modal>

        <Modal
          visible={genreModalVisible}
          onDismiss={() => setGenreModalVisible(false)}
          contentContainerStyle={styles.genreModalContainer}
        >
          <Text style={styles.genreModalTitle}>Selecione os Gêneros</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((genre) => (
              <Chip
                key={genre.name}
                style={[
                  styles.genreChip,
                  { backgroundColor: genre.color },
                  selectedGenres.includes(genre.name) && styles.genreChipSelected
                ]}
                textStyle={styles.genreChipText}
                onPress={() => handleGenreSelect(genre.name)}
              >
                {genre.name}
              </Chip>
            ))}
          </View>
          <View style={styles.genreModalButtons}>
            <Button
              mode="outlined"
              onPress={() => setGenreModalVisible(false)}
              style={styles.genreModalButton}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleGenreConfirm}
              style={styles.genreModalButton}
            >
              Confirmar
            </Button>
          </View>
        </Modal>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  searchBar: {
    marginVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  formCard: {
    backgroundColor: theme.colors.card,
    marginTop: theme.spacing.md,
    elevation: 2,
  },
  formContent: {
    padding: theme.spacing.lg,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  resultsContainer: {
    marginTop: theme.spacing.md,
  },
  resultCard: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
    elevation: 2,
  },
  resultCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
  },
  animeImage: {
    width: 80,
    height: 120,
    borderRadius: theme.borderRadius.sm,
  },
  animeInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  animeTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.xs,
  },
  animeScore: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  animeGenres: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
  },
  modalText: {
    ...theme.typography.text,
    marginBottom: theme.spacing.md,
  },
  modalInfo: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.sm,
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
  imageContainer: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  imageButton: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  selectedImageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  genreModalContainer: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  genreModalTitle: {
    ...theme.typography.title,
    marginBottom: theme.spacing.md,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  genreModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  genreModalButton: {
    flex: 1,
    marginHorizontal: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginVertical: theme.spacing.md,
  },
  genreChipSelected: {
    opacity: 0.8,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    ...theme.typography.title,
    flex: 1,
    marginRight: theme.spacing.md,
  },
}); 