// src/screens/RomanaScreen.tsx
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
import { RecepcionArroz, VariedadArroz } from '../types/recepcion';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { SyncQueueService } from '../services/SyncQueueService';
import { HeaderMenuModal } from '../components/HeaderMenuModal';

/**
 * Pantalla operativa y dashboard para la estación de Romana.
 * Captura pesajes de entrada y salida, datos del transporte y muestra métricas de la jornada.
 * Soporta encolamiento offline-first e integra menú lateral hamburguesa.
 */
const RomanaScreen: React.FC = () => {
    const { recepciones, guardarRecepcion, sincronizarPendientes, sincronizando } = useRecepcion();

    // Estado para el menú de hamburguesa
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    // Estados del formulario
    const [partnerId, setPartnerId] = useState<string>('');
    const [guiaSica, setGuiaSica] = useState<string>('');
    const [variedad, setVariedad] = useState<VariedadArroz>('fl_supa');
    const [vehiculoPlaca, setVehiculoPlaca] = useState<string>('');
    const [choferCedula, setChoferCedula] = useState<string>('');
    const [choferNombre, setChoferNombre] = useState<string>('');
    const [pesoBruto, setPesoBruto] = useState<string>('');
    const [pesoTara, setPesoTara] = useState<string>('');

    // Cálculos métricos para el dashboard
    const totalCamiones = recepciones.length;
    const totalKilos = recepciones.reduce((acum, item) => acum + (item.peso_neto || item.peso_bruto || 0), 0);

    // Cálculo automático de peso neto en formulario
    const brutoNum = parseFloat(pesoBruto) || 0;
    const taraNum = parseFloat(pesoTara) || 0;
    const pesoNeto = brutoNum > taraNum ? brutoNum - taraNum : 0;

    /**
     * Limpia los campos del formulario tras completar un registro.
     */
    const reiniciarFormulario = () => {
        setPartnerId('');
        setGuiaSica('');
        setVehiculoPlaca('');
        setChoferCedula('');
        setChoferNombre('');
        setPesoBruto('');
        setPesoTara('');
    };

    /**
     * Valida y guarda el registro de romana localmente y en la cola de sincronización.
     */
    const manejarGuardar = async () => {
        if (!partnerId.trim() || !guiaSica.trim() || !vehiculoPlaca.trim() || !pesoBruto.trim()) {
            Alert.alert('Campos Faltantes', 'Por favor complete el Productor, Guía SICA, Placa y Peso Bruto.');
            return;
        }

        const nuevaRecepcion: RecepcionArroz = {
            state: pesoTara ? 'pesaje_final' : 'pesaje_inicial',
            date_recepcion: new Date().toISOString(),
            partner_id: partnerId.trim(),
            guia_sica: guiaSica.trim(),
            variedad_arroz: variedad,
            vehiculo_placa: vehiculoPlaca.trim().toUpperCase(),
            chofer_cedula: choferCedula.trim(),
            chofer_nombre: choferNombre.trim(),
            peso_bruto: brutoNum,
            peso_tara: taraNum > 0 ? taraNum : undefined,
            peso_neto: pesoNeto > 0 ? pesoNeto : undefined,
        };

        try {
            await guardarRecepcion(nuevaRecepcion);
            await SyncQueueService.enqueue('/api/recepcion/sincronizar', nuevaRecepcion);

            Alert.alert(
                'Registro Exitoso',
                'La recepción se guardó localmente y se ha añadido a la cola de sincronización.'
            );
            reiniciarFormulario();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la recepción ni encolarla en la memoria local.');
        }
    };

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <View style={styles.barraSuperior}>
                <TouchableOpacity style={styles.botonHamburguesa} onPress={() => setMenuVisible(true)}>
                    <Text style={styles.textoHamburguesa}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.tituloEstacion}>ROMANA</Text>
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
                {/* Dashboard Superior */}
                <Text style={styles.seccionTitulo}>Métricas del Día</Text>
                <View style={styles.contenedorMetricas}>
                    <MetricCard
                        titulo="Camiones Atendidos"
                        valor={totalCamiones}
                        subtexto="Registros locales"
                        colorBorde="#2563EB"
                    />
                    <MetricCard
                        titulo="Total Recibido"
                        valor={`${(totalKilos / 1000).toFixed(1)} Tn`}
                        subtexto={`${totalKilos.toLocaleString('es-VE')} Kg`}
                        colorBorde="#16A34A"
                    />
                </View>

                {/* Formulario de Entrada */}
                <Text style={styles.seccionTitulo}>1. Datos de Origen y Transporte</Text>

                <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>Productor / Cliente *</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="Nombre o ID del Productor"
                        value={partnerId}
                        onChangeText={setPartnerId}
                    />
                </View>

                <View style={styles.filaCampos}>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Guía SICA *</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Nº Guía SICA"
                            value={guiaSica}
                            onChangeText={setGuiaSica}
                        />
                    </View>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Placa Vehículo *</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Ej: A12BC3"
                            value={vehiculoPlaca}
                            onChangeText={setVehiculoPlaca}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>Variedad de Arroz</Text>
                    <View style={styles.contenedorSelector}>
                        <TouchableOpacity
                            style={[
                                styles.opcionSelector,
                                variedad === 'fl_supa' && styles.opcionSeleccionada,
                            ]}
                            onPress={() => setVariedad('fl_supa')}
                        >
                            <Text style={variedad === 'fl_supa' ? styles.textoOpcionSeleccionada : styles.textoOpcion}>
                                FL SUPA
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.opcionSelector,
                                variedad === 'md_248' && styles.opcionSeleccionada,
                            ]}
                            onPress={() => setVariedad('md_248')}
                        >
                            <Text style={variedad === 'md_248' ? styles.textoOpcionSeleccionada : styles.textoOpcion}>
                                MD 248
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.opcionSelector,
                                variedad === 'cimarron' && styles.opcionSeleccionada,
                            ]}
                            onPress={() => setVariedad('cimarron')}
                        >
                            <Text style={variedad === 'cimarron' ? styles.textoOpcionSeleccionada : styles.textoOpcion}>
                                Cimarrón
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.opcionSelector,
                                variedad === 'otra' && styles.opcionSeleccionada,
                            ]}
                            onPress={() => setVariedad('otra')}
                        >
                            <Text style={variedad === 'otra' ? styles.textoOpcionSeleccionada : styles.textoOpcion}>
                                Otra
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.filaCampos}>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Cédula Chofer</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="V-00000000"
                            value={choferCedula}
                            onChangeText={setChoferCedula}
                        />
                    </View>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Nombre Chofer</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="Nombre del Chofer"
                            value={choferNombre}
                            onChangeText={setChoferNombre}
                        />
                    </View>
                </View>

                <Text style={styles.seccionTitulo}>2. Control de Pesaje (Kg)</Text>

                <View style={styles.filaCampos}>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Peso Bruto (Kg) *</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={pesoBruto}
                            onChangeText={setPesoBruto}
                        />
                    </View>
                    <View style={[styles.grupoCampo, styles.campoMedio]}>
                        <Text style={styles.etiqueta}>Peso Tara (Kg)</Text>
                        <TextInput
                            style={styles.entrada}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={pesoTara}
                            onChangeText={setPesoTara}
                        />
                    </View>
                </View>

                <View style={styles.cajaPesoNeto}>
                    <View style={styles.filaNetoBadge}>
                        <Text style={styles.etiquetaNeto}>PESO NETO CALCULADO</Text>
                        <StatusBadge estado={pesoTara ? 'pesaje_final' : 'pesaje_inicial'} />
                    </View>
                    <Text style={styles.valorNeto}>{pesoNeto.toLocaleString('es-VE')} Kg</Text>
                </View>

                <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardar}>
                    <Text style={styles.textoBotonGuardar}>Guardar Registro en Romana</Text>
                </TouchableOpacity>
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
        backgroundColor: '#2563EB',
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
        backgroundColor: '#1D4ED8',
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
    grupoCampo: {
        marginBottom: 12,
    },
    filaCampos: {
        flexDirection: 'row',
        gap: 12,
    },
    campoMedio: {
        flex: 1,
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
    contenedorSelector: {
        flexDirection: 'row',
        gap: 6,
    },
    opcionSelector: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    opcionSeleccionada: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    textoOpcion: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },
    textoOpcionSeleccionada: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    cajaPesoNeto: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: 8,
        padding: 14,
        marginVertical: 12,
    },
    filaNetoBadge: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    etiquetaNeto: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1E40AF',
    },
    valorNeto: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1D4ED8',
        marginTop: 4,
    },
    botonGuardar: {
        backgroundColor: '#2563EB',
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

export default RomanaScreen;