import axios from 'axios';
import { RecepcionArroz, RespuestaApiOdoo, UsuarioSesion } from '../types/recepcion';

/**
 * Servicio cliente API HTTP para la comunicacion con el backend de Odoo.
 * Maneja autenticacion, envio de recepciones y sincronizacion offline.
 */

// URL Base del servidor Odoo (Ajustar IP o dominio segun el entorno de red local/servidor)
const ODOO_BASE_URL = 'http://192.168.1.122:8069';

const apiClient = axios.create({
    baseURL: ODOO_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export class ApiService {
    /**
     * Envia las credenciales del usuario al endpoint de login en Odoo.
     */
    static async login(login: string, password: string): Promise<RespuestaApiOdoo<UsuarioSesion>> {
        try {
            const response = await apiClient.post('/api/recepcion/login', {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    login,
                    password,
                },
            });

            const data = response.data?.result || response.data;

            if (data && data.status === 'success') {
                return {
                    status: 'success',
                    data: {
                        uid: data.uid,
                        name: data.name,
                        login: data.login,
                        session_id: data.session_id,
                    },
                };
            }

            return {
                status: 'error',
                message: data?.message || 'Error de autenticacion con Odoo.',
            };
        } catch (error: any) {
            console.error('Error durante la peticion de login:', error);
            return {
                status: 'error',
                message: error.message || 'No se pudo conectar con el servidor Odoo.',
            };
        }
    }

    /**
     * Sincroniza un registro de recepcion local hacia el backend de Odoo.
     */
    static async sincronizarRecepcion(
        recepcion: RecepcionArroz,
        sessionId: string
    ): Promise<RespuestaApiOdoo> {
        try {
            const response = await apiClient.post(
                '/api/recepcion/sincronizar',
                {
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        local_id: recepcion.local_id,
                        id: recepcion.id,
                        valores: {
                            partner_id: recepcion.partner_id,
                            guia_sica: recepcion.guia_sica,
                            variedad_arroz: recepcion.variedad_arroz,
                            vehiculo_placa: recepcion.vehiculo_placa,
                            chofer_cedula: recepcion.chofer_cedula,
                            chofer_nombre: recepcion.chofer_nombre,
                            peso_bruto: recepcion.peso_bruto,
                            peso_tara: recepcion.peso_tara,
                            porcentaje_humedad: recepcion.porcentaje_humedad,
                            porcentaje_impureza: recepcion.porcentaje_impureza,
                            porcentaje_grano_rojo: recepcion.porcentaje_grano_rojo,
                            state: recepcion.state,
                            motivo_modificacion: recepcion.motivo_modificacion,
                        },
                    },
                },
                {
                    headers: {
                        Cookie: `session_id=${sessionId}`,
                    },
                }
            );

            const data = response.data?.result || response.data;

            if (data && data.status === 'success') {
                return {
                    status: 'success',
                    local_id: data.local_id,
                    id: data.id,
                    name: data.name,
                    state: data.state,
                };
            }

            return {
                status: 'error',
                local_id: recepcion.local_id,
                message: data?.message || 'Error al procesar la sincronizacion en Odoo.',
            };
        } catch (error: any) {
            console.error('Error al sincronizar recepcion con Odoo:', error);
            return {
                status: 'error',
                local_id: recepcion.local_id,
                message: error.message || 'Error de conexion de red con Odoo.',
            };
        }
    }
}