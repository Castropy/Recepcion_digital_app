// src/hooks/useNetworkSync.ts
import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { SyncQueueService } from '../services/SyncQueueService';

interface UseNetworkSyncOptions {
    baseUrl: string;
    sessionId?: string;
    autoSync?: boolean;
}

/**
 * Hook personalizado que monitorea el estado de la conexión a red
 * y desencadena la sincronización de la cola offline al reconectarse.
 */
export const useNetworkSync = ({ baseUrl, sessionId, autoSync = true }: UseNetworkSyncOptions) => {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [pendingCount, setPendingCount] = useState<number>(0);

    /**
     * Actualiza el conteo de elementos pendientes en la cola local.
     */
    const refreshPendingCount = async () => {
        const queue = await SyncQueueService.getQueue();
        setPendingCount(queue.length);
    };

    /**
     * Ejecuta el proceso de sincronización manual de la cola.
     */
    const syncNow = async () => {
        if (isSyncing || !baseUrl) {
            return;
        }

        setIsSyncing(true);
        try {
            await SyncQueueService.processQueue(baseUrl, sessionId);
            await refreshPendingCount();
        } catch (error: any) {
            console.error('Error durante la sincronización manual:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        // Carga inicial del contador de registros pendientes
        refreshPendingCount();

        // Suscripción al estado de la red del dispositivo
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const online = Boolean(state.isConnected && state.isInternetReachable !== false);

            // Si la red cambia a online y la autosincronización está activa, se ejecuta la cola
            if (online && !isConnected && autoSync) {
                syncNow();
            }

            setIsConnected(online);
        });

        return () => {
            unsubscribe();
        };
    }, [isConnected, autoSync, baseUrl, sessionId]);

    return {
        isConnected,
        isSyncing,
        pendingCount,
        syncNow,
        refreshPendingCount,
    };
};