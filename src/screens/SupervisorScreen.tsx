// src/screens/SupervisorScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { MetricCard } from '../components/MetricCard';
import { StationHeader } from '../components/StationHeader';
import { AuditLogModal } from '../components/AuditLogModal';
import { HeaderMenuModal } from '../components/HeaderMenuModal';
import { SupervisorForm } from '../components/SupervisorForm';
import { useSupervisorForm } from '../hooks/useSupervisorForm';

/**
 * Pantalla para la estación de Supervisión.
 */
const SupervisorScreen: React.FC = () => {
    const { recepciones, sincronizarPendientes, sincronizando } = useRecepcion();
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const {
        recepcionSeleccionada,
        recepcionAuditoria,
        modalAuditoriaVisible,
        form,
        setters,
        seleccionarRegistro,
        abrirAuditoria,
        cerrarAuditoria,
        manejarAprobarOEditar,
    } = useSupervisorForm();

    const total = recepciones.length;
    const completadas = recepciones.filter((r) => r.state === 'completado').length;
    const enProceso = recepciones.filter(
        (r) => r.state === 'pesaje_inicial' || r.state === 'laboratorio' || r.state === 'pesaje_final'
    ).length;
    const borradores = recepciones.filter((r) => r.state === 'borrador').length;

    return (
        <SafeAreaView style={styles.contenedorPantalla}>
            <StationHeader
                titulo="SUPERVISIÓN"
                colorFondo="#7C3AED"
                sincronizando={sincronizando}
                onAbrirMenu={() => setMenuVisible(true)}
                onSincronizar={sincronizarPendientes}
            />

            <ScrollView contentContainerStyle={styles.contenidoScroll}>
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

                <SupervisorForm
                    recepciones={recepciones}
                    recepcionSeleccionada={recepcionSeleccionada}
                    form={form}
                    setters={setters}
                    onSeleccionar={seleccionarRegistro}
                    onAbrirAuditoria={abrirAuditoria}
                    onSubmit={manejarAprobarOEditar}
                />
            </ScrollView>

            <AuditLogModal
                visible={modalAuditoriaVisible}
                recepcion={recepcionAuditoria}
                onClose={cerrarAuditoria}
            />

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
    gridMetricas: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default SupervisorScreen;