import AsyncStorage from '@react-native-async-storage/async-storage';
import { RecepcionArroz } from '../types/recepcion';

/**
 * Servicio de almacenamiento local persistente para gestion offline de recepciones.
 * Utiliza AsyncStorage para guardar la cola de registros pendientes de sincronizar con Odoo.
 */

const STORAGE_KEY_RECEPCIONES = '@recepciones_local_v1';
const STORAGE_KEY_SESION = '@sesion_usuario_v1';

export class DatabaseService {
    /**
     * Obtiene la lista completa de recepciones guardadas localmente en el dispositivo.
     */
    static async obtenerRecepcionesLocales(): Promise<RecepcionArroz[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_RECEPCIONES);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (error) {
            console.error('Error al recuperar las recepciones locales:', error);
            return [];
        }
    }

    /**
     * Guarda o actualiza un registro de recepcion en la memoria local.
     * Si no posee local_id, se le genera uno unico de forma automatica.
     */
    static async guardarRecepcionLocal(recepcion: RecepcionArroz): Promise<RecepcionArroz> {
        try {
            const listaActual = await this.obtenerRecepcionesLocales();
            const fechaActual = new Date().toISOString();

            const registroAProcesar: RecepcionArroz = {
                ...recepcion,
                local_id: recepcion.local_id || `LOCAL_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                sincronizado: recepcion.sincronizado ?? false,
                fecha_modificacion_local: fechaActual,
            };

            const indiceExistente = listaActual.findIndex(
                (item) => item.local_id === registroAProcesar.local_id || (item.id && item.id === registroAProcesar.id)
            );

            if (indiceExistente >= 0) {
                listaActual[indiceExistente] = registroAProcesar;
            } else {
                listaActual.push(registroAProcesar);
            }

            await AsyncStorage.setItem(STORAGE_KEY_RECEPCIONES, JSON.stringify(listaActual));
            return registroAProcesar;
        } catch (error) {
            console.error('Error al guardar la recepcion localmente:', error);
            throw error;
        }
    }

    /**
     * Retorna únicamente los registros que no han sido sincronizados con Odoo.
     */
    static async obtenerPendientesSincronizacion(): Promise<RecepcionArroz[]> {
        const lista = await this.obtenerRecepcionesLocales();
        return lista.filter((item) => !item.sincronizado);
    }

    /**
     * Marca un registro local como sincronizado y le asigna el ID definitivo de Odoo.
     */
    static async marcarComoSincronizado(localId: string, odooId: number, odooName: string): Promise<void> {
        try {
            const listaActual = await this.obtenerRecepcionesLocales();
            const listaActualizada = listaActual.map((item) => {
                if (item.local_id === localId) {
                    return {
                        ...item,
                        id: odooId,
                        name: odooName,
                        sincronizado: true,
                    };
                }
                return item;
            });

            await AsyncStorage.setItem(STORAGE_KEY_RECEPCIONES, JSON.stringify(listaActualizada));
        } catch (error) {
            console.error('Error al actualizar estado de sincronizacion local:', error);
        }
    }

    /**
     * Limpia todos los datos locales almacenados (util para cierre de sesion o reseteo).
     */
    static async limpiarDatosLocales(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY_RECEPCIONES);
            await AsyncStorage.removeItem(STORAGE_KEY_SESION);
        } catch (error) {
            console.error('Error al limpiar los datos locales:', error);
        }
    }
}