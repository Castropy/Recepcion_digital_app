import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UsuarioSesion, RolUsuario } from '../types/recepcion';
import { ApiService } from '../services/api';

/**
 * Contexto global para la gestion del estado de autenticacion y rol activo en la app movil.
 */

interface AuthContextData {
    usuario: UsuarioSesion | null;
    rolActivo: RolUsuario | null;
    cargando: boolean;
    iniciarSesion: (login: string, password: string) => Promise<{ exito: boolean; mensaje?: string }>;
    seleccionarRol: (rol: RolUsuario) => Promise<void>;
    cerrarSesion: () => Promise<void>;
}

const STORAGE_KEY_AUTH = '@sesion_usuario_v1';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
    const [rolActivo, setRolActivo] = useState<RolUsuario | null>(null);
    const [cargando, setCargando] = useState<boolean>(true);

    // Cargar sesion persistida al iniciar la aplicacion
    useEffect(() => {
        const cargarSesionPersistida = async () => {
            try {
                const sesionGuardada = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
                if (sesionGuardada) {
                    const datosSesion: UsuarioSesion = JSON.parse(sesionGuardada);
                    setUsuario(datosSesion);
                    if (datosSesion.role) {
                        setRolActivo(datosSesion.role);
                    }
                }
            } catch (error) {
                console.error('Error al recuperar la sesion almacenada:', error);
            } finally {
                setCargando(false);
            }
        };

        cargarSesionPersistida();
    }, []);

    /**
     * Autentica al usuario contra el servidor Odoo y guarda los datos localmente.
     */
    const iniciarSesion = async (login: string, password: string) => {
        const respuesta = await ApiService.login(login, password);

        if (respuesta.status === 'success' && respuesta.data) {
            const nuevaSesion: UsuarioSesion = respuesta.data;
            setUsuario(nuevaSesion);
            await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(nuevaSesion));
            return { exito: true };
        }

        return { exito: false, mensaje: respuesta.message || 'Error de autenticacion.' };
    };

    /**
     * Asigna el rol operativo actual (Romana, Laboratorio o Supervisor) a la sesion activa.
     */
    const seleccionarRol = async (rol: RolUsuario) => {
        if (!usuario) return;

        const usuarioActualizado: UsuarioSesion = {
            ...usuario,
            role: rol,
        };

        setUsuario(usuarioActualizado);
        setRolActivo(rol);
        await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(usuarioActualizado));
    };

    /**
     * Limpia los datos de sesion en el estado y en el almacenamiento local.
     */
    const cerrarSesion = async () => {
        setUsuario(null);
        setRolActivo(null);
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    };

    return (
        <AuthContext.Provider
            value={{
                usuario,
                rolActivo,
                cargando,
                iniciarSesion,
                seleccionarRol,
                cerrarSesion,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextData => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
};