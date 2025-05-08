// Importa componente de imagem otimizada do Expo
import { Image } from 'expo-image';
// Importa utilitários de plataforma e estilos do React Native
import { Platform, StyleSheet } from 'react-native';

// Importa componentes customizados do projeto
import { Collapsible } from '@/components/Collapsible'; // Componente de seção expansível
import { ExternalLink } from '@/components/ExternalLink'; // Link externo estilizado
import ParallaxScrollView from '@/components/ParallaxScrollView'; // Scroll com efeito parallax
import { ThemedText } from '@/components/ThemedText'; // Texto com suporte a tema
import { ThemedView } from '@/components/ThemedView'; // View com suporte a tema
import { IconSymbol } from '@/components/ui/IconSymbol'; // Ícone customizado

// Componente principal da tela Explore
export default function TabTwoScreen() {
  return (
    // ParallaxScrollView: Scroll com imagem de cabeçalho e efeito parallax
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }} // Cor do fundo do header
      headerImage={
        // Ícone grande no header
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      {/* Título da tela */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      {/* Texto introdutório */}
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      {/* Seção expansível sobre rotas baseadas em arquivos */}
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* Seção expansível sobre suporte multiplataforma */}
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      {/* Seção expansível sobre imagens */}
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* Seção expansível sobre fontes customizadas */}
      <Collapsible title="Custom fonts">
        <ThemedText>
          Open <ThemedText type="defaultSemiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
          <ThemedText style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* Seção expansível sobre suporte a tema claro/escuro */}
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      {/* Seção expansível sobre animações */}
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful <ThemedText type="defaultSemiBold">react-native-reanimated</ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {/* Exemplo específico para iOS */}
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

// Estilos da tela Explore
const styles = StyleSheet.create({
  headerImage: {
    color: '#808080', // Cor do ícone do header
    bottom: -90,     // Posição vertical do ícone
    left: -35,       // Posição horizontal do ícone
    position: 'absolute', // Posição absoluta no header
  },
  titleContainer: {
    flexDirection: 'row', // Layout em linha para o título
    gap: 8,              // Espaço entre elementos
  },
});