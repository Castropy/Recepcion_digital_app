import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { RecepcionArroz } from '../types/recepcion';
import { DatabaseService } from '../services/database';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';

/**
 * Contexto global para la gestion de la cola offline, sincronizacion
 * y operaciones sobre los registros de recepcion de arroz.
 */

interface RecepcionContextData {
    recepciones: RecepcionArroz[];
    cargando: boolean;
    sincronizando: boolean;
    guardarRecepcion: (recepcion: RecepcionArroz) => Promise<RecepcionArroz>;
    sincronizarPendientes: () => Promise<void>;
    recargarRecepciones: () => Promise<void>;
}

const RecepcionContext = createContext<RecepcionContextData>({} as RecepcionContextData);

export const RecepcionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [recepciones, setRecepciones] = useState<RecepcionArroz[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [sincronizando, setSincronizando] = useState<boolean>(false);
    const { usuario } = useAuth();

    /**
     * Carga los registros almacenados en el dispositivo al iniciar el proveedor.
     */
    const recargarRecepciones = async () => {
        setCargando(true);
        try {
            const listaLocales = await DatabaseService.obtenerRecepcionesLocales();
            setRecepciones(listaLocales);
        } catch (error) {
            console.error('Error al cargar recepciones en el contexto:', error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        recargarRecepciones();
    }, []);

    /**
     * Guarda una recepcion en el almacenamiento local y refresca el estado.
     */
    const guardarRecepcion = async (recepcion: RecepcionArroz): Promise<RecepcionArroz> => {
        const registroGuardado = await DatabaseService.guardarRecepcionLocal(recepcion);
        await recargarRecepciones();
        return registroGuardado;
    };

    /**
     * Recorre la cola de registros no sincronizados y los envia a Odoo uno a uno.
     */
    const sincronizarPendientes = async () => {
        if (!usuario?.session_id || sincronizando) return;

        setSincronizando(true);
        try {
            const pendientes = await DatabaseService.obtenerPendientesSincronizacion();

            for (const registro of pendientes) {
                if (!registro.local_id) continue;

                const respuesta = await ApiService.sincronizarRecepcion(registro, usuario.session_id);

                if (respuesta.status === 'success' && respuesta.id && respuesta.name) {
                    await DatabaseService.marcarComoSincronizado(
                        registro.local_id,
                        respuesta.id,
                        respuesta.name
                    );
                }
            }

            await recargarRecepciones();
        } catch (error) {
            console.error('Error durante el proceso de sincronizacion masiva:', error);
        } finally {
            setSincronizando(false);
        }
    };

    return (
        <RecepcionContext.Provider
            value={{
                recepciones,
                cargando,
                sincronizando,
                guardarRecepcion,
                sincronizarPendientes,
                recargarRecepciones,
            }}
        >
            {children}
        </RecepcionContext.Provider>
    );
};

export const useRecepcion = (): RecepcionContextData => {
    const context = useContext(RecepcionContext);
    if (!context) {
        throw new Error('useRecepcion debe ser utilizado dentro de un RecepcionProvider');
    }
    return context;
};