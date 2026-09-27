import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { RecepcionProvider } from './src/context/RecepcionContext';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Componente Raiz de la Aplicacion Movil Recepcion Digital.
 * Encapsula la navegacion y los proveedores de contexto global (Autenticacion y Recepciones).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RecepcionProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </RecepcionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}