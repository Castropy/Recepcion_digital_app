// src/screens/LaboratorioScreen.tsx
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
import { RecepcionArroz } from '../types/recepcion';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { SyncQueueService } from '../services/SyncQueueService';
import { HeaderMenuModal } from '../components/HeaderMenuModal';

/**
 * Pantalla operativa y dashboard para la estación de Laboratorio.
 * Permite seleccionar recepciones pendientes y registrar análisis de calidad (% humedad, % impureza, % grano rojo).
 * Integra encolamiento offline-first e interfaz con menú lateral hamburguesa.
 */
const LaboratorioScreen: React.FC = () => {
    const { recepciones, guardarRecepcion, sincronizarPendientes, sincronizando } = useRecepcion();

    // Estado para controlar la visibilidad del menú hamburguesa
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<RecepcionArroz | null>(null);
    const [porcentajeHumedad, setPorcentajeHumedad] = useState<string>('');
    const [porcentajeImpureza, setPorcentajeImpureza] = useState<string>('');
    const [porcentajeGranoRojo, setPorcentajeGranoRojo] = useState<string>('');

    // Métricas del laboratorio
    const analizados = recepciones.filter((r) => r.state === 'laboratorio' || r.state === 'pesaje_final' || r.state === 'completado').length;
    const pendientes = recepciones.filter((r) => r.state === 'pesaje_inicial' || r.state === 'borrador').length;

    /**
     * Carga los datos de una recepción seleccionada en los campos de laboratorio.
     */
    const seleccionarRegistro = (registro: RecepcionArroz) => {
        setRecepcionSeleccionada(registro);
        setPorcentajeHumedad(registro.porcentaje_humedad ? registro.porcentaje_humedad.toString() : '');
        setPorcentajeImpureza(registro.porcentaje_impureza ? registro.porcentaje_impureza.toString() : '');
        setPorcentajeGranoRojo(registro.porcentaje_grano_rojo ? registro.porcentaje_grano_rojo.toString() : '');
    };

    /**
     * Valida y guarda los resultados del análisis de laboratorio en el almacenamiento local y en la cola de sincronización.
     */
    const manejarGuardar = async () => {
        if (!recepcionSeleccionada) {
            Alert.alert('Selección Requerida', 'Por favor seleccione una recepción de la lista para analizar.');
            return;
        }

        if (!porcentajeHumedad.trim() || !porcentajeImpureza.trim()) {
            Alert.alert('Campos Faltantes', 'Por favor ingrese al menos el % de humedad y % de impureza.');
            return;
        }

        const registroActualizado: RecepcionArroz = {
            ...recepcionSeleccionada,
            porcentaje_humedad: parseFloat(porcentajeHumedad),
            porcentaje_impureza: parseFloat(porcentajeImpureza),
            porcentaje_grano_rojo: porcentajeGranoRojo ? parseFloat(porcentajeGranoRojo) : 0,
            state: 'laboratorio',
        };

        try {
            // Guardado en el contexto local del dispositivo
            await guardarRecepcion(registroActualizado);

            // Encolamiento en SyncQueueService para envío automático a Odoo
            await SyncQueueService.enqueue('/api/recepcion/sincronizar', registroActualizado);

            Alert.alert(
                'Análisis Guardado',
                'Los datos del laboratorio se guardaron localmente y se añadieron a la cola de sincronización.'
            );
            setRecepcionSeleccionada(null);
            setPorcentajeHumedad('');
            setPorcentajeImpureza('');
            setPorcentajeGranoRojo('');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar ni encolar los análisis en la memoria local.');
        }
    };

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <View style={styles.barraSuperior}>
                <TouchableOpacity style={styles.botonHamburguesa} onPress={() => setMenuVisible(true)}>
                    <Text style={styles.textoHamburguesa}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.tituloEstacion}>LABORATORIO</Text>
                <TouchableOpacity
                    style={styles.botonSincronizar}
                    onPress={sincronizarPendientes}
                    disabled={sincronizando}
                >
                    <Text style={styles.textoBotonSincronizar}>
                        {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
                {/* Dashboard Muestras */}
                <Text style={styles.seccionTitulo}>Métricas de Calidad</Text>
                <View style={styles.contenedorMetricas}>
                    <MetricCard
                        titulo="Pendientes por Analizar"
                        valor={pendientes}
                        subtexto="Muestras en espera"
                        colorBorde="#D97706"
                    />
                    <MetricCard
                        titulo="Muestras Procesadas"
                        valor={analizados}
                        subtexto="Análisis completados"
                        colorBorde="#16A34A"
                    />
                </View>

                {/* Lista de Recepciones */}
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
                                    onPress={() => seleccionarRegistro(item)}
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

                {/* Formulario de Análisis */}
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
                                value={porcentajeHumedad}
                                onChangeText={setPorcentajeHumedad}
                            />
                        </View>

                        <View style={styles.grupoCampo}>
                            <Text style={styles.etiqueta}>% Impureza *</Text>
                            <TextInput
                                style={styles.entrada}
                                placeholder="Ej. 4.2"
                                keyboardType="numeric"
                                value={porcentajeImpureza}
                                onChangeText={setPorcentajeImpureza}
                            />
                        </View>

                        <View style={styles.grupoCampo}>
                            <Text style={styles.etiqueta}>% Grano Rojo</Text>
                            <TextInput
                                style={styles.entrada}
                                placeholder="Ej. 1.0"
                                keyboardType="numeric"
                                value={porcentajeGranoRojo}
                                onChangeText={setPorcentajeGranoRojo}
                            />
                        </View>

                        <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardar}>
                            <Text style={styles.textoBotonGuardar}>Guardar Análisis de Laboratorio</Text>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>

            {/* Modal de Menú Lateral Hamburguesa */}
            <HeaderMenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contenedorPantalla: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    barraSuperior: {
        backgroundColor: '#D97706',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    botonHamburguesa: {
        padding: 4,
    },
    textoHamburguesa: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    tituloEstacion: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    botonSincronizar: {
        backgroundColor: '#B45309',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    textoBotonSincronizar: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
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
    contenedorMetricas: {
        flexDirection: 'row',
        gap: 12,
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

export default LaboratorioScreen;