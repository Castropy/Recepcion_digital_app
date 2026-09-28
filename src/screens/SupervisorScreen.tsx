import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { useAuth } from '../context/AuthContext';
import { RecepcionArroz } from '../types/recepcion';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

/**
 * Pantalla para la estación de Supervisión.
 * Permite la revisión, aprobación final, métricas globales y edición auditada de recepciones.
 */
const SupervisorScreen: React.FC = () => {
    const { recepciones, guardarRecepcion, sincronizarPendientes, sincronizando } = useRecepcion();
    const { seleccionarRol } = useAuth();

    const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<RecepcionArroz | null>(null);
    const [pesoBruto, setPesoBruto] = useState<string>('');
    const [porcentajeHumedad, setPorcentajeHumedad] = useState<string>('');
    const [motivoModificacion, setMotivoModificacion] = useState<string>('');

    // Métricas generales del sistema para el supervisor
    const total = recepciones.length;
    const completadas = recepciones.filter((r) => r.state === 'completado').length;
    const enProceso = recepciones.filter(
        (r) => r.state === 'pesaje_inicial' || r.state === 'laboratorio' || r.state === 'pesaje_final'
    ).length;
    const borradores = recepciones.filter((r) => r.state === 'borrador').length;

    /**
     * Carga los datos del registro en los campos modificables.
     */
    const seleccionarRegistro = (registro: RecepcionArroz) => {
        setRecepcionSeleccionada(registro);
        setPesoBruto(registro.peso_bruto ? registro.peso_bruto.toString() : '');
        setPorcentajeHumedad(registro.porcentaje_humedad ? registro.porcentaje_humedad.toString() : '');
        setMotivoModificacion('');
    };

    /**
     * Procesa la edición o aprobación final del registro auditado.
     */
    const manejarAprobarOEditar = async (nuevoEstado: 'completado' | 'cancelado' | undefined) => {
        if (!recepcionSeleccionada) {
            Alert.alert('Selección Requerida', 'Por favor seleccione una recepción para supervisar.');
            return;
        }

        // Si hubo cambios en los valores, exigir motivo de modificación
        const brutoActual = parseFloat(pesoBruto) || 0;
        const humedadActual = parseFloat(porcentajeHumedad) || 0;
        const huboCambios =
            brutoActual !== (recepcionSeleccionada.peso_bruto || 0) ||
            humedadActual !== (recepcionSeleccionada.porcentaje_humedad || 0);

        if (huboCambios && !motivoModificacion.trim()) {
            Alert.alert(
                'Motivo Requerido',
                'Ha modificado valores del registro. Ingrese el motivo de la modificación por auditoría.'
            );
            return;
        }

        const registroActualizado: RecepcionArroz = {
            ...recepcionSeleccionada,
            peso_bruto: brutoActual,
            porcentaje_humedad: humedadActual,
            motivo_modificacion: motivoModificacion.trim() || undefined,
            state: nuevoEstado || recepcionSeleccionada.state,
        };

        try {
            await guardarRecepcion(registroActualizado);
            Alert.alert('Registro Actualizado', 'La recepción fue actualizada y guardada exitosamente.');
            setRecepcionSeleccionada(null);
            setPesoBruto('');
            setPorcentajeHumedad('');
            setMotivoModificacion('');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron actualizar los datos del registro.');
        }
    };

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <View style={styles.barraSuperior}>
                <Text style={styles.tituloEstacion}>Estación: SUPERVISIÓN</Text>
                <View style={styles.contenedorAccionesBarra}>
                    <TouchableOpacity
                        style={styles.botonSincronizar}
                        onPress={sincronizarPendientes}
                        disabled={sincronizando}
                    >
                        <Text style={styles.textoBotonSincronizar}>
                            {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => seleccionarRol('supervisor')}>
                        <Text style={styles.textoCambiarRol}>Rol</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
                {/* Dashboard Métricas Globales */}
                <Text style={styles.seccionTitulo}>Métricas del Proceso</Text>
                <View style={styles.gridMetricas}>
                    <MetricCard
                        titulo="Total Registros"
                        valor={total}
                        subtexto="Lotes procesados"
                        colorBorde="#7C3AED"
                    />
                    <MetricCard
                        titulo="En Proceso"
                        valor={enProceso}
                        subtexto="Báscula / Lab"
                        colorBorde="#2563EB"
                    />
                </View>
                <View style={[styles.gridMetricas, { marginTop: 8 }]}>
                    <MetricCard
                        titulo="Completadas"
                        valor={completadas}
                        subtexto="Finalizadas"
                        colorBorde="#16A34A"
                    />
                    <MetricCard
                        titulo="Borradores"
                        valor={borradores}
                        subtexto="Sin confirmar"
                        colorBorde="#D97706"
                    />
                </View>

                {/* Registros en Cola General */}
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
                                    onPress={() => seleccionarRegistro(item)}
                                >
                                    <View style={styles.encabezadoTarjeta}>
                                        <Text style={styles.itemTitulo}>Guía: {item.guia_sica}</Text>
                                        <StatusBadge estado={item.state} />
                                    </View>
                                    <Text style={styles.itemSubtitulo}>
                                        Placa: {item.vehiculo_placa} | Productor: {item.partner_id}
                                    </Text>
                                    <Text style={styles.itemDetalles}>
                                        Peso Bruto: {item.peso_bruto || 0} Kg | Humedad: {item.porcentaje_humedad || 0}%
                                    </Text>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>

                {/* Formulario de Edición Auditada */}
                {recepcionSeleccionada && (
                    <>
                        <Text style={styles.seccionTitulo}>
                            2. Revisión y Ajustes: {recepcionSeleccionada.guia_sica}
                        </Text>

                        <View style={styles.grupoCampo}>
                            <Text style={styles.etiqueta}>Peso Bruto (Kg)</Text>
                            <TextInput
                                style={styles.entrada}
                                keyboardType="numeric"
                                value={pesoBruto}
                                onChangeText={setPesoBruto}
                            />
                        </View>

                        <View style={styles.grupoCampo}>
                            <Text style={styles.etiqueta}>% Humedad</Text>
                            <TextInput
                                style={styles.entrada}
                                keyboardType="numeric"
                                value={porcentajeHumedad}
                                onChangeText={setPorcentajeHumedad}
                            />
                        </View>

                        <View style={styles.grupoCampo}>
                            <Text style={styles.etiqueta}>Motivo de Modificación / Justificación *</Text>
                            <TextInput
                                style={[styles.entrada, styles.entradaMultilinea]}
                                placeholder="Obligatorio si modifica un valor registrado"
                                multiline
                                numberOfLines={3}
                                value={motivoModificacion}
                                onChangeText={setMotivoModificacion}
                            />
                        </View>

                        <View style={styles.contenedorBotones}>
                            <TouchableOpacity
                                style={[styles.botonAccion, styles.botonCompletar]}
                                onPress={() => manejarAprobarOEditar('completado')}
                            >
                                <Text style={styles.textoBotonAccion}>Aprobar / Completar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.botonAccion, styles.botonCancelar]}
                                onPress={() => manejarAprobarOEditar('cancelado')}
                            >
                                <Text style={styles.textoBotonAccion}>Anular Recepción</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contenedorPantalla: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    barraSuperior: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tituloEstacion: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    contenedorAccionesBarra: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    botonSincronizar: {
        backgroundColor: '#6D28D9',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    textoBotonSincronizar: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    textoCambiarRol: {
        color: '#EDE9FE',
        fontSize: 13,
    },
    contenidoScroll: {
        padding: 16,
    },
    seccionTitulo: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 8,
    },
    gridMetricas: {
        flexDirection: 'row',
        gap: 12,
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
    itemDetalles: {
        fontSize: 11,
        color: '#7C3AED',
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

export default SupervisorScreen;