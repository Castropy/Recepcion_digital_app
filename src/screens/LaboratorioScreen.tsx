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
    FlatList,
} from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { useAuth } from '../context/AuthContext';
import { RecepcionArroz } from '../types/recepcion';

/**
 * Pantalla operativa para la estacion de Laboratorio.
 * Registra los analisis de calidad del arroz paddy (humedad, impureza y grano rojo).
 */
const LaboratorioScreen: React.FC = () => {
    const { recepciones, guardarRecepcion, sincronizarPendientes, sincronizando } = useRecepcion();
    const { seleccionarRol } = useAuth();

    const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<RecepcionArroz | null>(null);
    const [porcentajeHumedad, setPorcentajeHumedad] = useState<string>('');
    const [porcentajeImpureza, setPorcentajeImpureza] = useState<string>('');
    const [porcentajeGranoRojo, setPorcentajeGranoRojo] = useState<string>('');

    /**
     * Carga los datos de una recepcion seleccionada en los campos de laboratorio.
     */
    const seleccionarRegistro = (registro: RecepcionArroz) => {
        setRecepcionSeleccionada(registro);
        setPorcentajeHumedad(registro.porcentaje_humedad ? registro.porcentaje_humedad.toString() : '');
        setPorcentajeImpureza(registro.porcentaje_impureza ? registro.porcentaje_impureza.toString() : '');
        setPorcentajeGranoRojo(registro.porcentaje_grano_rojo ? registro.porcentaje_grano_rojo.toString() : '');
    };

    /**
     * Valida y guarda los resultados del analisis de laboratorio.
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
            await guardarRecepcion(registroActualizado);
            Alert.alert('Análisis Guardado', 'Los datos del laboratorio se asociaron a la recepción exitosamente.');
            setRecepcionSeleccionada(null);
            setPorcentajeHumedad('');
            setPorcentajeImpureza('');
            setPorcentajeGranoRojo('');
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar los análisis en la memoria local.');
        }
    };

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <View style={styles.barraSuperior}>
                <Text style={styles.tituloEstacion}>Estación: LABORATORIO</Text>
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
                    <TouchableOpacity onPress={() => seleccionarRol('laboratorio' as any)}>
                        <Text style={styles.textoCambiarRol}>Rol</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
                <Text style={styles.seccionTitulo}>1. Recepciones Pendientes por Calidad</Text>

                <View style={styles.listaContenedor}>
                    {recepciones.length === 0 ? (
                        <Text style={styles.textoVacio}>No hay recepciones registradas en el dispositivo.</Text>
                    ) : (
                        recepciones.map((item, index) => (
                            <TouchableOpacity
                                key={item.local_id || index}
                                style={[
                                    styles.tarjetaItem,
                                    recepcionSeleccionada?.local_id === item.local_id && styles.tarjetaSeleccionada,
                                ]}
                                onPress={() => seleccionarRegistro(item)}
                            >
                                <Text style={styles.itemTitulo}>
                                    Guía SICA: {item.guia_sica} | Placa: {item.vehiculo_placa}
                                </Text>
                                <Text style={styles.itemSubtitulo}>
                                    Productor: {item.partner_id} | Estado: {item.state}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {recepcionSeleccionada && (
                    <>
                        <Text style={styles.seccionTitulo}>
                            2. Análisis para Guía SICA: {recepcionSeleccionada.guia_sica}
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
    textoCambiarRol: {
        color: '#FEF3C7',
        fontSize: 13,
    },
    contenidoScroll: {
        padding: 16,
    },
    seccionTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 12,
        marginBottom: 12,
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
        borderColor: '#D97706',
        backgroundColor: '#FFFBEB',
    },
    itemTitulo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    itemSubtitulo: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
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
        marginTop: 12,
        marginBottom: 24,
    },
    textoBotonGuardar: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LaboratorioScreen;