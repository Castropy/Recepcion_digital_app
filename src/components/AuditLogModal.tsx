import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import { RecepcionArroz } from '../types/recepcion';
import { StatusBadge } from './StatusBadge';

interface AuditLogModalProps {
    visible: boolean;
    recepcion: RecepcionArroz | null;
    onClose: () => void;
}

/**
 * Componente modal para visualizar la trazabilidad e historial de auditoria de un registro de recepcion.
 * Muestra el motivo de modificaciones, la fecha de edicion local y el estado de sincronizacion.
 */
export const AuditLogModal: React.FC<AuditLogModalProps> = ({
    visible,
    recepcion,
    onClose,
}) => {
    if (!recepcion) {
        return null;
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.fondoOscuro}>
                <View style={styles.tarjetaModal}>
                    <View style={styles.encabezadoModal}>
                        <Text style={styles.tituloModal}>Historial y Auditoría</Text>
                        <TouchableOpacity onPress={onClose} style={styles.botonCerrar}>
                            <Text style={styles.textoBotonCerrar}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.contenidoScroll}>
                        {/* Informacion de Identificacion */}
                        <View style={styles.seccionInfo}>
                            <Text style={styles.etiquetaSeccion}>Identificación del Lote</Text>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>Guía SICA:</Text>
                                <Text style={styles.valorCampo}>{recepcion.guia_sica}</Text>
                            </View>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>Placa Vehículo:</Text>
                                <Text style={styles.valorCampo}>{recepcion.vehiculo_placa}</Text>
                            </View>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>Estado Actual:</Text>
                                <StatusBadge estado={recepcion.state} />
                            </View>
                        </View>

                        {/* Sincronizacion */}
                        <View style={styles.seccionInfo}>
                            <Text style={styles.etiquetaSeccion}>Trazabilidad y Sincronización</Text>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>ID Local Dispositivo:</Text>
                                <Text style={styles.valorCampo}>{recepcion.local_id || 'N/A'}</Text>
                            </View>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>ID Odoo Backend:</Text>
                                <Text style={styles.valorCampo}>{recepcion.id || 'Pendiente'}</Text>
                            </View>
                            <View style={styles.filaDetalle}>
                                <Text style={styles.etiquetaCampo}>Estatus Sincronizado:</Text>
                                <Text
                                    style={[
                                        styles.valorCampo,
                                        recepcion.sincronizado ? styles.textoVerde : styles.textoNaranja,
                                    ]}
                                >
                                    {recepcion.sincronizado ? 'Sincronizado con Odoo' : 'Pendiente en cola local'}
                                </Text>
                            </View>
                            {recepcion.fecha_modificacion_local && (
                                <View style={styles.filaDetalle}>
                                    <Text style={styles.etiquetaCampo}>Última Modificación Local:</Text>
                                    <Text style={styles.valorCampo}>
                                        {new Date(recepcion.fecha_modificacion_local).toLocaleString('es-VE')}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Justificaciones y Motivos de Auditoria */}
                        <View style={styles.seccionInfo}>
                            <Text style={styles.etiquetaSeccion}>Motivo de Modificación / Auditoría</Text>
                            {recepcion.motivo_modificacion ? (
                                <View style={styles.cajaMotivo}>
                                    <Text style={styles.textoMotivo}>{recepcion.motivo_modificacion}</Text>
                                </View>
                            ) : (
                                <Text style={styles.textoSinModificacion}>
                                    No se han registrado modificaciones manuales por supervisión.
                                </Text>
                            )}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.botonAceptar} onPress={onClose}>
                        <Text style={styles.textoBotonAceptar}>Entendido</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fondoOscuro: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    tarjetaModal: {
        width: '100%',
        maxHeight: '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    encabezadoModal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 12,
        marginBottom: 12,
    },
    tituloModal: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    botonCerrar: {
        padding: 4,
    },
    textoBotonCerrar: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: 'bold',
    },
    contenidoScroll: {
        marginBottom: 12,
    },
    seccionInfo: {
        marginBottom: 14,
    },
    etiquetaSeccion: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 6,
    },
    filaDetalle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
    },
    etiquetaCampo: {
        fontSize: 13,
        color: '#475569',
    },
    valorCampo: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
    },
    textoVerde: {
        color: '#16A34A',
    },
    textoNaranja: {
        color: '#D97706',
    },
    cajaMotivo: {
        backgroundColor: '#FEF3C7',
        borderLeftWidth: 3,
        borderLeftColor: '#D97706',
        padding: 10,
        borderRadius: 6,
        marginTop: 4,
    },
    textoMotivo: {
        fontSize: 13,
        color: '#78350F',
        fontStyle: 'italic',
    },
    textoSinModificacion: {
        fontSize: 12,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    botonAceptar: {
        backgroundColor: '#7C3AED',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    textoBotonAceptar: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});