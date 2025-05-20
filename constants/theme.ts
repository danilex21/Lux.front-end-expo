import { TextStyle } from 'react-native';
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    background: '#F7F7F7',
    surface: '#FFFFFF',
    text: '#2D3436',
    error: '#FF5252',
    card: '#FFFFFF',
    border: '#E0E0E0',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700' as TextStyle['fontWeight'],
      color: '#2D3436',
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as TextStyle['fontWeight'],
      color: '#2D3436',
    },
    text: {
      fontSize: 16,
      color: '#2D3436',
    },
    caption: {
      fontSize: 14,
      color: '#636E72',
    },
  },
};

export const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.text,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
  },
}; 