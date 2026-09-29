// src/screens/LaboratorioScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { MetricCard } from '../components/MetricCard';
import { StationHeader } from '../components/StationHeader';
import { HeaderMenuModal } from '../components/HeaderMenuModal';
import { LaboratorioForm } from '../components/LaboratorioForm';
import { useLaboratorioForm } from '../hooks/useLaboratorioForm';

/**
 * Pantalla operativa y dashboard para la estación de Laboratorio.
 */
const LaboratorioScreen: React.FC = () => {
    const { recepciones, sincronizarPendientes, sincronizando } = useRecepcion();
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const {
        recepcionSeleccionada,
        form,
        setters,
        seleccionarRegistro,
        manejarGuardar,
    } = useLaboratorioForm();

    const analizados = recepciones.filter((r) => r.state === 'laboratorio' || r.state === 'pesaje_final' || r.state === 'completado').length;
    const pendientes = recepciones.filter((r) => r.state === 'pesaje_inicial' || r.state === 'borrador').length;

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <StationHeader
                titulo="LABORATORIO"
                colorFondo="#D97706"
                sincronizando={sincronizando}
                onAbrirMenu={() => setMenuVisible(true)}
                onSincronizar={sincronizarPendientes}
            />

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
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

                <LaboratorioForm
                    recepciones={recepciones}
                    recepcionSeleccionada={recepcionSeleccionada}
                    form={form}
                    setters={setters}
                    onSeleccionar={seleccionarRegistro}
                    onSubmit={manejarGuardar}
                />
            </ScrollView>

            <HeaderMenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    contenedorPantalla: {
        flex: 1,
        backgroundColor: '#F8FAFC',
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
});

export default LaboratorioScreen;