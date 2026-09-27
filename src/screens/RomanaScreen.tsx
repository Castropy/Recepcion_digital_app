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
import { RecepcionArroz, VariedadArroz } from '../types/recepcion';

/**
 * Pantalla operativa para la estacion de Romana.
 * Captura datos de origen, transporte, peso bruto y peso tara.
 */
const RomanaScreen: React.FC = () => {
    const { guardarRecepcion, sincronizarPendientes, sincronizando } = useRecepcion();
    const { seleccionarRol, cerrarSesion } = useAuth();

    // Estados del formulario
    const [partnerId, setPartnerId] = useState<string>('');
    const [guiaSica, setGuiaSica] = useState<string>('');
    const [variedad, setVariedad] = useState<VariedadArroz>('fl_supa');
    const [vehiculoPlaca, setVehiculoPlaca] = useState<string>('');
    const [choferCedula, setChoferCedula] = useState<string>('');
    const [choferNombre, setChoferNombre] = useState<string>('');
    const [pesoBruto, setPesoBruto] = useState<string>('');
    const [pesoTara, setPesoTara] = useState<string>('');

    // Calculo automatico de peso neto
    const brutoNum = parseFloat(pesoBruto) || 0;
    const taraNum = parseFloat(pesoTara) || 0;
    const pesoNeto = brutoNum > taraNum ? brutoNum - taraNum : 0;

    /**
     * Limpia los campos tras completar un registro exitoso.
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
     * Valida y guarda el registro de romana en la memoria local.
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
            Alert.alert('Guardado Exitoso', 'La recepción se guardó localmente en la cola de romana.');
            reiniciarFormulario();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la recepción en la memoria local.');
        }
    };

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <View style={styles.barraSuperior}>
                <Text style={styles.tituloEstacion}>Estación: ROMANA</Text>
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
                    <TouchableOpacity onPress={() => seleccionarRol('romana' as any)}>
                        <Text style={styles.textoCambiarRol}>Rol</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
                <Text style={styles.seccionTitulo}>1. Datos del Origen y Transporte</Text>

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
                    <Text style={styles.etiquetaNeto}>PESO NETO CALCULADO:</Text>
                    <Text style={styles.valorNeto}>{pesoNeto.toLocaleString('es-VE')} Kg</Text>
                </View>

                <TouchableOpacity style={styles.botonGuardar} onPress={manejarGuardar}>
                    <Text style={styles.textoBotonGuardar}>Guardar Registro en Romana</Text>
                </TouchableOpacity>
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
        backgroundColor: '#2563EB',
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
    textoCambiarRol: {
        color: '#E0F2FE',
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
    cajaPesoNeto: {
        backgroundColor: '#EFF6FF',
        borderWidth: 1,
        borderColor: '#BFDBFE',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginVertical: 16,
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