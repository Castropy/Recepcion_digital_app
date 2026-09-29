// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RecepcionProvider } from './src/context/RecepcionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SyncStatusBanner } from './src/components/SyncStatusBanner';
import { useNetworkSync } from './src/hooks/UseNetworkSync';

/**
 * Componente interno que conecta el hook de sincronización
 * y renderiza el banner global de estado de red.
 */
const MainLayout = () => {
  const authState = useAuth();

  // Se extraen valores de sesión si existen en el contexto o se pasa string vacío para fallback
  const baseUrl = (authState as any)?.baseUrl || (authState as any)?.user?.baseUrl || '';
  const sessionId = (authState as any)?.sessionId || (authState as any)?.user?.sessionId;

  const { isConnected, isSyncing, pendingCount, syncNow } = useNetworkSync({
    baseUrl,
    sessionId,
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