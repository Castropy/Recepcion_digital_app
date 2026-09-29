// src/services/SyncQueueService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/**
 * Interfaz que define la estructura de un elemento dentro de la cola de sincronización.
 */
export interface QueueItem {
    id: string;
    endpoint: string;
    payload: Record<string, any>;
    attempts: number;
    createdAt: string;
}

/**
 * Interfaz que define el resultado de la ejecución del proceso de sincronización.
 */
export interface SyncResult {
    successCount: number;
    failedCount: number;
}

const QUEUE_STORAGE_KEY = '@recepcion_digital_sync_queue';

/**
 * Servicio encargado de gestionar la cola de operaciones offline
 * y su posterior sincronización con la API de Odoo.
 */
export class SyncQueueService {
    /**
     * Recupera la lista de elementos almacenados en la cola local de AsyncStorage.
     */
    static async getQueue(): Promise<QueueItem[]> {
        try {
            const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error: any) {
            console.error('Error al obtener la cola de sincronización:', error);
            return [];
        }
    }

    /**
     * Encola un nuevo registro pendiente de sincronizar en AsyncStorage.
     */
    static async enqueue(endpoint: string, payload: Record<string, any>): Promise<QueueItem> {
        const currentQueue = await this.getQueue();
        const newItem: QueueItem = {
            id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            endpoint,
            payload,
            attempts: 0,
            createdAt: new Date().toISOString(),
        };

        const updatedQueue = [...currentQueue, newItem];
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
        return newItem;
    }

    /**
     * Remueve un elemento de la cola local tras ser procesado con éxito.
     */
    static async dequeue(id: string): Promise<void> {
        const currentQueue = await this.getQueue();
        const updatedQueue = currentQueue.filter((item) => item.id !== id);
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    }

    /**
     * Incrementa el contador de reintentos de un elemento específico en la cola.
     */
    static async incrementAttempts(id: string): Promise<void> {
        const currentQueue = await this.getQueue();
        const updatedQueue = currentQueue.map((item) => {
            if (item.id === id) {
                return { ...item, attempts: item.attempts + 1 };
            }
            return item;
        });
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedQueue));
    }

    /**
     * Procesa secuencialmente los elementos de la cola enviándolos a Odoo.
     */
    static async processQueue(baseUrl: string, sessionId?: string): Promise<SyncResult> {
        const queue = await this.getQueue();
        if (queue.length === 0) {
            return { successCount: 0, failedCount: 0 };
        }

        let successCount = 0;
        let failedCount = 0;

        for (const item of queue) {
            if (item.attempts >= 5) {
                failedCount++;
                continue;
            }

            try {
                const response = await axios.post(
                    `${baseUrl}${item.endpoint}`,
                    {
                        jsonrpc: '2.0',
                        method: 'call',
                        params: {
                            local_id: item.id,
                            ...item.payload,
                        },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            ...(sessionId ? { Cookie: `session_id=${sessionId}` } : {}),
                        },
                        timeout: 10000,
                    }
                );

                const result = response.data?.result || response.data;

                if (result?.status === 'success' || result?.success) {
                    await this.dequeue(item.id);
                    successCount++;
                } else {
                    await this.incrementAttempts(item.id);
                    failedCount++;
                }
            } catch (error: any) {
                console.error(`Error procesando elemento ${item.id} en ${item.endpoint}:`, error);
                await this.incrementAttempts(item.id);
                failedCount++;
            }
        }

        return { successCount, failedCount };
    }

    /**
     * Elimina por completo la cola de sincronización de AsyncStorage.
     */
    static async clearQueue(): Promise<void> {
        await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    }
}