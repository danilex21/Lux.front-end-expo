import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { theme } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.card,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-animes"
        options={{
          title: 'Meus Animes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="playlist-star" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
