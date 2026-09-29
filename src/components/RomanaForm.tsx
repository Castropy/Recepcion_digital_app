// src/components/RomanaForm.tsx
import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { VariedadArroz } from '../types/recepcion';
import { StatusBadge } from './StatusBadge';

interface RomanaFormProps {
    form: {
        partnerId: string;
        guiaSica: string;
        variedad: VariedadArroz;
        vehiculoPlaca: string;
        choferCedula: string;
        choferNombre: string;
        pesoBruto: string;
        pesoTara: string;
        pesoNeto: number;
    };
    setters: {
        setPartnerId: (val: string) => void;
        setGuiaSica: (val: string) => void;
        setVariedad: (val: VariedadArroz) => void;
        setVehiculoPlaca: (val: string) => void;
        setChoferCedula: (val: string) => void;
        setChoferNombre: (val: string) => void;
        setPesoBruto: (val: string) => void;
        setPesoTara: (val: string) => void;
    };
    onSubmit: () => void;
}

export const RomanaForm: React.FC<RomanaFormProps> = ({ form, setters, onSubmit }) => {
    return (
        <View>
            <Text style={styles.seccionTitulo}>1. Datos de Origen y Transporte</Text>

            <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>Productor / Cliente *</Text>
                <TextInput
                    style={styles.entrada}
                    placeholder="Nombre o ID del Productor"
                    value={form.partnerId}
                    onChangeText={setters.setPartnerId}
                />
            </View>

            <View style={styles.filaCampos}>
                <View style={[styles.grupoCampo, styles.campoMedio]}>
                    <Text style={styles.etiqueta}>Guía SICA *</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="Nº Guía SICA"
                        value={form.guiaSica}
                        onChangeText={setters.setGuiaSica}
                    />
                </View>
                <View style={[styles.grupoCampo, styles.campoMedio]}>
                    <Text style={styles.etiqueta}>Placa Vehículo *</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="Ej: A12BC3"
                        value={form.vehiculoPlaca}
                        onChangeText={setters.setVehiculoPlaca}
                        autoCapitalize="characters"
                    />
                </View>
            </View>

            <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>Variedad de Arroz</Text>
                <View style={styles.contenedorSelector}>
                    {(['fl_supa', 'md_248', 'cimarron', 'otra'] as VariedadArroz[]).map((varOption) => (
                        <TouchableOpacity
                            key={varOption}
                            style={[
                                styles.opcionSelector,
                                form.variedad === varOption && styles.opcionSeleccionada,
                            ]}
                            onPress={() => setters.setVariedad(varOption)}
                        >
                            <Text
                                style={
                                    form.variedad === varOption
                                        ? styles.textoOpcionSeleccionada
                                        : styles.textoOpcion
                                }
                            >
                                {varOption === 'fl_supa'
                                    ? 'FL SUPA'
                                    : varOption === 'md_248'
                                        ? 'MD 248'
                                        : varOption === 'cimarron'
                                            ? 'Cimarrón'
                                            : 'Otra'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.filaCampos}>
                <View style={[styles.grupoCampo, styles.campoMedio]}>
                    <Text style={styles.etiqueta}>Cédula Chofer</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="V-00000000"
                        value={form.choferCedula}
                        onChangeText={setters.setChoferCedula}
                    />
                </View>
                <View style={[styles.grupoCampo, styles.campoMedio]}>
                    <Text style={styles.etiqueta}>Nombre Chofer</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="Nombre del Chofer"
                        value={form.choferNombre}
                        onChangeText={setters.setChoferNombre}
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
                        value={form.pesoBruto}
                        onChangeText={setters.setPesoBruto}
                    />
                </View>
                <View style={[styles.grupoCampo, styles.campoMedio]}>
                    <Text style={styles.etiqueta}>Peso Tara (Kg)</Text>
                    <TextInput
                        style={styles.entrada}
                        placeholder="0.00"
                        keyboardType="numeric"
                        value={form.pesoTara}
                        onChangeText={setters.setPesoTara}
                    />
                </View>
            </View>

            <View style={styles.cajaPesoNeto}>
                <View style={styles.filaNetoBadge}>
                    <Text style={styles.etiquetaNeto}>PESO NETO CALCULADO</Text>
                    <StatusBadge estado={form.pesoTara ? 'pesaje_final' : 'pesaje_inicial'} />
                </View>
                <Text style={styles.valorNeto}>{form.pesoNeto.toLocaleString('es-VE')} Kg</Text>
            </View>

            <TouchableOpacity style={styles.botonGuardar} onPress={onSubmit}>
                <Text style={styles.textoBotonGuardar}>Guardar Registro en Romana</Text>
            </TouchableOpacity>
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