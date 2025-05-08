// Importa o componente de ícones do Expo para usar ícones nas abas
import { MaterialCommunityIcons } from '@expo/vector-icons';
// Importa o componente de navegação por abas do Expo Router
import { Tabs } from 'expo-router';
// Importa o tema de cores e estilos do app
import { theme } from '../../constants/theme';

// Componente principal que define o layout das abas do app
export default function TabLayout() {
  return (
    // Tabs: componente que define as abas inferiores de navegação
    <Tabs
      screenOptions={{ // Opções visuais e de estilo das abas
        tabBarStyle: {
          backgroundColor: theme.colors.background, // Cor de fundo da barra de abas
          borderTopColor: theme.colors.card,        // Cor da borda superior da barra
        },
        tabBarActiveTintColor: theme.colors.primary,   // Cor do ícone/texto ativo
        tabBarInactiveTintColor: theme.colors.text,    // Cor do ícone/texto inativo
        headerStyle: {
          backgroundColor: theme.colors.background,    // Cor de fundo do cabeçalho
        },
        headerTintColor: theme.colors.text,            // Cor do texto do cabeçalho
      }}
    >
      {/* Tela Home (inicial) */}
      <Tabs.Screen
        name="index" // Nome do arquivo da tela
        options={{
          title: 'Home', // Título exibido na aba
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} /> // Ícone da aba
          ),
        }}
      />
      {/* Tela de adicionar anime */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Adicionar', // Título exibido na aba
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size} color={color} /> // Ícone da aba
          ),
        }}
      />
      {/* Tela de meus animes */}
      <Tabs.Screen
        name="my-animes"
        options={{
          title: 'Meus Animes', // Título exibido na aba
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="playlist-star" size={size} color={color} /> // Ícone da aba
          ),
        }}
      />
    </Tabs>
  );
}