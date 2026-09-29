// src/screens/RomanaScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { MetricCard } from '../components/MetricCard';
import { StationHeader } from '../components/StationHeader';
import { HeaderMenuModal } from '../components/HeaderMenuModal';
import { RomanaForm } from '../components/RomanaForm';
import { useRomanaForm } from '../hooks/useRomanaForm';

/**
 * Pantalla de la estación Romana. Integra la orquestación y presentación modular.
 */
const RomanaScreen: React.FC = () => {
    const { recepciones, sincronizarPendientes, sincronizando } = useRecepcion();
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const { form, setters, manejarGuardar } = useRomanaForm();

    const totalCamiones = recepciones.length;
    const totalKilos = recepciones.reduce(
        (acum, item) => acum + (item.peso_neto || item.peso_bruto || 0),
        0
    );

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <StationHeader
                titulo="ROMANA"
                colorFondo="#2563EB"
                sincronizando={sincronizando}
                onAbrirMenu={() => setMenuVisible(true)}
                onSincronizar={sincronizarPendientes}
            />

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
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

                <RomanaForm form={form} setters={setters} onSubmit={manejarGuardar} />
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

export default RomanaScreen;