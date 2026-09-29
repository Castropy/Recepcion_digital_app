// src/components/SupervisorForm.tsx
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { RecepcionArroz } from '../types/recepcion';
import { StatusBadge } from './StatusBadge';

interface SupervisorFormProps {
    recepciones: RecepcionArroz[];
    recepcionSeleccionada: RecepcionArroz | null;
    form: {
        pesoBruto: string;
        porcentajeHumedad: string;
        motivoModificacion: string;
    };
    setters: {
        setPesoBruto: (val: string) => void;
        setPorcentajeHumedad: (val: string) => void;
        setMotivoModificacion: (val: string) => void;
    };
    onSeleccionar: (registro: RecepcionArroz) => void;
    onAbrirAuditoria: (registro: RecepcionArroz) => void;
    onSubmit: (nuevoEstado: 'completado' | 'cancelado' | undefined) => void;
}

export const SupervisorForm: React.FC<SupervisorFormProps> = ({
    recepciones,
    recepcionSeleccionada,
    form,
    setters,
    onSeleccionar,
    onAbrirAuditoria,
    onSubmit,
}) => {
    return (
        <View>
            <Text style={styles.seccionTitulo}>1. Registros en Cola General</Text>

            <View style={styles.listaContenedor}>
                {recepciones.length === 0 ? (
                    <Text style={styles.textoVacio}>No hay recepciones guardadas localmente.</Text>
                ) : (
                    recepciones.map((item, index) => {
                        const esSeleccionado = Boolean(
                            (recepcionSeleccionada?.local_id && recepcionSeleccionada.local_id === item.local_id) ||
                            (recepcionSeleccionada?.id && item.id && recepcionSeleccionada.id === item.id)
                        );
                        return (
                            <TouchableOpacity
                                key={item.local_id || item.id || index}
                                style={[
                                    styles.tarjetaItem,
                                    esSeleccionado ? styles.tarjetaSeleccionada : null,
                                ]}
                                onPress={() => onSeleccionar(item)}
                            >
                                <View style={styles.encabezadoTarjeta}>
                                    <Text style={styles.itemTitulo}>Guía: {item.guia_sica}</Text>
                                    <StatusBadge estado={item.state} />
                                </View>
                                <Text style={styles.itemSubtitulo}>
                                    Placa: {item.vehiculo_placa} | Productor: {item.partner_id}
                                </Text>

                                <View style={styles.filaInferiorTarjeta}>
                                    <Text style={styles.itemDetalles}>
                                        Peso Bruto: {item.peso_bruto || 0} Kg | Humedad: {item.porcentaje_humedad || 0}%
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.botonVerAuditoria}
                                        onPress={() => onAbrirAuditoria(item)}
                                    >
                                        <Text style={styles.textoBotonVerAuditoria}>🔍 Auditoría</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            {recepcionSeleccionada && (
                <>
                    <View style={styles.encabezadoFormularioEdicion}>
                        <Text style={styles.seccionTituloFormulario}>
                            2. Revisión: Guía {recepcionSeleccionada.guia_sica}
                        </Text>
                        <TouchableOpacity
                            style={styles.botonVerAuditoriaFormulario}
                            onPress={() => onAbrirAuditoria(recepcionSeleccionada)}
                        >
                            <Text style={styles.textoBotonVerAuditoriaFormulario}>Ver Historial</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>Peso Bruto (Kg)</Text>
                        <TextInput
                            style={styles.entrada}
                            keyboardType="numeric"
                            value={form.pesoBruto}
                            onChangeText={setters.setPesoBruto}
                        />
                    </View>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>% Humedad</Text>
                        <TextInput
                            style={styles.entrada}
                            keyboardType="numeric"
                            value={form.porcentajeHumedad}
                            onChangeText={setters.setPorcentajeHumedad}
                        />
                    </View>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>Motivo de Modificación / Justificación *</Text>
                        <TextInput
                            style={[styles.entrada, styles.entradaMultilinea]}
                            placeholder="Obligatorio si modifica un valor registrado"
                            multiline
                            numberOfLines={3}
                            value={form.motivoModificacion}
                            onChangeText={setters.setMotivoModificacion}
                        />
                    </View>

                    <View style={styles.contenedorBotones}>
                        <TouchableOpacity
                            style={[styles.botonAccion, styles.botonCompletar]}
                            onPress={() => onSubmit('completado')}
                        >
                            <Text style={styles.textoBotonAccion}>Aprobar / Completar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.botonAccion, styles.botonCancelar]}
                            onPress={() => onSubmit('cancelado')}
                        >
                            <Text style={styles.textoBotonAccion}>Anular Recepción</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    seccionTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 8,
    },
    listaContenedor: {
        marginBottom: 16,
    },
    textoVacio: {
        color: '#64748B',
        fontStyle: 'italic',
        textAlign: 'center',
        marginVertical: 12,
    },
    tarjetaItem: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
    },
    tarjetaSeleccionada: {
        borderColor: '#7C3AED',
        backgroundColor: '#F5F3FF',
    },
    encabezadoTarjeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTitulo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    itemSubtitulo: {
        fontSize: 12,
        color: '#64748B',
    },
    filaInferiorTarjeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    itemDetalles: {
        fontSize: 11,
        color: '#7C3AED',
        fontWeight: '600',
    },
    botonVerAuditoria: {
        backgroundColor: '#EDE9FE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    textoBotonVerAuditoria: {
        fontSize: 11,
        color: '#6D28D9',
        fontWeight: 'bold',
    },
    encabezadoFormularioEdicion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    seccionTituloFormulario: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    botonVerAuditoriaFormulario: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    textoBotonVerAuditoriaFormulario: {
        fontSize: 11,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    grupoCampo: {
        marginBottom: 12,
    },
    etiqueta: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 4,
    },
    entrada: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 15,
        color: '#0F172A',
    },
    entradaMultilinea: {
        height: 70,
        textAlignVertical: 'top',
    },
    contenedorBotones: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        marginBottom: 24,
    },
    botonAccion: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    botonCompletar: {
        backgroundColor: '#16A34A',
    },
    botonCancelar: {
        backgroundColor: '#DC2626',
    },
    textoBotonAccion: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
});