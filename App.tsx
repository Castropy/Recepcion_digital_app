// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RecepcionProvider } from './src/context/RecepcionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SyncStatusBanner } from './src/components/SyncStatusBanner';
import { useNetworkSync } from './src/hooks/useNetworkSync';

/**
 * Componente interno que conecta el hook de sincronización
 * con los datos del AuthContext y renderiza el banner global.
 */
const MainLayout = () => {
  const { session } = useAuth();

  const { isConnected, isSyncing, pendingCount, syncNow } = useNetworkSync({
    baseUrl: session?.baseUrl || '',
    sessionId: session?.sessionId,
    autoSync: true,
  });

  return (
    <>
      <SyncStatusBanner
        isConnected={isConnected}
        isSyncing={isSyncing}
        pendingCount={pendingCount}
        onSyncNow={syncNow}
      />
      <AppNavigator />
    </>
  );
};

/**
 * Componente Raíz de la Aplicación Móvil Recepción Digital.
 * Encapsula la navegación y los proveedores de contexto global (Autenticación y Recepciones).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RecepcionProvider>
          <StatusBar style="auto" />
          <MainLayout />
        </RecepcionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}