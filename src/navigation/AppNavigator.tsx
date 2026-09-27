import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Importacion de pantallas (se crearan en los siguientes pasos)
import LoginScreen from '../screens/LoginScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import RomanaScreen from '../screens/RomanaScreen';
import LaboratorioScreen from '../screens/LaboratorioScreen';
import SupervisorScreen from '../screens/SupervisorScreen';

/**
 * Definicion de rutas y parametros permitidos en el Stack de navegacion principal.
 */
export type RootStackParamList = {
    Login: undefined;
    RoleSelection: undefined;
    Romana: undefined;
    Laboratorio: undefined;
    Supervisor: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Componente Navegador Principal.
 * Controla el renderizado condicional de pantallas segun el estado de autenticacion y rol del usuario.
 */
export const AppNavigator: React.FC = () => {
    const { usuario, rolActivo, cargando } = useAuth();

    if (cargando) {
        // Podria renderizarse un indicador de carga global aqui si fuere necesario
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!usuario ? (
                    // Flujo no autenticado
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : !rolActivo ? (
                    // Flujo autenticado sin rol seleccionado
                    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                ) : (
                    // Flujo autenticado con rol asignado
                    <>
                        {rolActivo === 'romana' && (
                            <Stack.Screen name="Romana" component={RomanaScreen} />
                        )}
                        {rolActivo === 'laboratorio' && (
                            <Stack.Screen name="Laboratorio" component={LaboratorioScreen} />
                        )}
                        {rolActivo === 'supervisor' && (
                            <Stack.Screen name="Supervisor" component={SupervisorScreen} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};