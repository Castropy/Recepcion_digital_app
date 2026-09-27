/**
 * Definiciones de tipos e interfaces TypeScript para la aplicacion movil de Recepcion Digital.
 * Define la estructura de datos utilizada en las colas offline y la comunicacion con Odoo.
 */

// Estados del flujo operativo de la recepcion
export type EstadoRecepcion =
    | 'borrador'
    | 'pesaje_inicial'
    | 'laboratorio'
    | 'pesaje_final'
    | 'completado'
    | 'cancelado';

// Variedades de arroz paddy soportadas
export type VariedadArroz =
    | 'fl_supa'
    | 'md_248'
    | 'cimarron'
    | 'otra';

// Roles operativos soportados dentro de la aplicacion movil
export type RolUsuario = 'romana' | 'laboratorio' | 'supervisor';

// Modelo completo de Recepcion de Arroz
export interface RecepcionArroz {
    local_id?: string;             // Identificador temporal generado en el dispositivo para operaciones offline
    id?: number;                   // ID asignado por Odoo tras la sincronizacion
    name?: string;                 // Folio o secuencia asignada por Odoo (ej. REC/00001)
    state: EstadoRecepcion;
    date_recepcion: string;        // Fecha en formato ISO string

    // Datos del Productor y Trazabilidad
    partner_id: number | string;   // ID del res.partner o nombre si se registra nuevo
    guia_sica: string;
    variedad_arroz: VariedadArroz;

    // Datos del Transporte y Conductor
    vehiculo_placa: string;
    chofer_cedula: string;
    chofer_nombre: string;

    // Datos de Pesaje en Romana (kg)
    operador_id?: number;
    peso_bruto?: number;
    peso_tara?: number;
    peso_neto?: number;

    // Datos de Analisis en Laboratorio (%)
    analista_id?: number;
    porcentaje_humedad?: number;
    porcentaje_impureza?: number;
    porcentaje_grano_rojo?: number;

    // Resultados de Liquidacion (kg)
    descuento_humedad_kg?: number;
    descuento_impureza_kg?: number;
    peso_acondicionado?: number;

    // Campos para control de auditoria y sincronizacion
    motivo_modificacion?: string;  // Justificacion de cambios si el registro esta siendo editado
    sincronizado?: boolean;        // Estado del registro en la cola local
    fecha_modificacion_local?: string;
}

// Estructura de credenciales y sesion de usuario
export interface UsuarioSesion {
    uid: number;
    name: string;
    login: string;                 // Cedula o nombre de usuario
    session_id: string;
    role?: RolUsuario;
}

// Estructura de respuesta estandar de la API de Odoo
export interface RespuestaApiOdoo<T = any> {
    status: 'success' | 'error';
    message?: string;
    data?: T;
    local_id?: string;
    id?: number;
    name?: string;
    state?: EstadoRecepcion;
}