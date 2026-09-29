// src/components/LaboratorioForm.tsx
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { RecepcionArroz } from '../types/recepcion';
import { StatusBadge } from './StatusBadge';

interface LaboratorioFormProps {
    recepciones: RecepcionArroz[];
    recepcionSeleccionada: RecepcionArroz | null;
    form: {
        porcentajeHumedad: string;
        porcentajeImpureza: string;
        porcentajeGranoRojo: string;
    };
    setters: {
        setPorcentajeHumedad: (val: string) => void;
        setPorcentajeImpureza: (val: string) => void;
        setPorcentajeGranoRojo: (val: string) => void;
    };
    onSeleccionar: (registro: RecepcionArroz) => void;
    onSubmit: () => void;
}

export const LaboratorioForm: React.FC<LaboratorioFormProps> = ({
    recepciones,
    recepcionSeleccionada,
    form,
    setters,
    onSeleccionar,
    onSubmit,
}) => {
    return (
        <View>
            <Text style={styles.seccionTitulo}>1. Selección de Lote / Recepción</Text>

            <View style={styles.listaContenedor}>
                {recepciones.length === 0 ? (
                    <Text style={styles.textoVacio}>No hay recepciones registradas en el dispositivo.</Text>
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
                                    <Text style={styles.itemTitulo}>Guía SICA: {item.guia_sica}</Text>
                                    <StatusBadge estado={item.state} />
                                </View>
                                <Text style={styles.itemSubtitulo}>
                                    Placa: {item.vehiculo_placa} | Productor: {item.partner_id}
                                </Text>
                                {item.porcentaje_humedad !== undefined && (
                                    <Text style={styles.itemCalidad}>
                                        Humedad: {item.porcentaje_humedad}% | Impureza: {item.porcentaje_impureza}%
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>

            {recepcionSeleccionada && (
                <>
                    <Text style={styles.seccionTitulo}>
                        2. Análisis Físico - Guía: {recepcionSeleccionada.guia_sica}
                    </Text>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>% Humedad *</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Ej. 21.5"
                            keyboardType="numeric"
                            value={form.porcentajeHumedad}
                            onChangeText={setters.setPorcentajeHumedad}
                        />
                    </View>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>% Impureza *</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Ej. 4.2"
                            keyboardType="numeric"
                            value={form.porcentajeImpureza}
                            onChangeText={setters.setPorcentajeImpureza}
                        />
                    </View>

                    <View style={styles.grupoCampo}>
                        <Text style={styles.etiqueta}>% Grano Rojo</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Ej. 1.0"
                            keyboardType="numeric"
                            value={form.porcentajeGranoRojo}
                            onChangeText={setters.setPorcentajeGranoRojo}
                        />
                    </View>

                    <TouchableOpacity style={styles.botonGuardar} onPress={onSubmit}>
                        <Text style={styles.textoBotonGuardar}>Guardar Análisis de Laboratorio</Text>
                    </TouchableOpacity>
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
        marginBottom: 12,
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
        borderColor: '#D97706',
        backgroundColor: '#FFFBEB',
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
    itemCalidad: {
        fontSize: 11,
        color: '#D97706',
        fontWeight: '600',
        marginTop: 4,
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
    botonGuardar: {
        backgroundColor: '#D97706',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    textoBotonGuardar: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});