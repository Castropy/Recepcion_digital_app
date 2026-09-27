import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RolUsuario } from '../types/recepcion';

/**
 * Pantalla para la seleccion del rol operativo tras autenticarse.
 * Permite alternar entre Romana, Laboratorio y Supervision.
 */
const RoleSelectionScreen: React.FC = () => {
    const { usuario, seleccionarRol, cerrarSesion } = useAuth();

    /**
     * Maneja el evento de seleccion de perfil y actualiza el contexto.
     */
    const manejarSeleccion = async (rol: RolUsuario) => {
        await seleccionarRol(rol);
    };

    return (
        <ScrollView contentContainerStyle={styles.contenedorPrincipal}>
            <View style={styles.encabezado}>
                <Text style={styles.textoBienvenida}>Bienvenido,</Text>
                <Text style={styles.nombreUsuario}>{usuario?.name || usuario?.login}</Text>
                <Text style={styles.instruccion}>Seleccione el rol operativo para este dispositivo:</Text>
            </View>

            <View style={styles.contenedorTarjetas}>
                <TouchableOpacity
                    style={[styles.tarjetaRol, styles.bordeRomana]}
                    onPress={() => manejarSeleccion('romana')}
                >
                    <Text style={styles.tituloRol}>Romana</Text>
                    <Text style={styles.descripcionRol}>
                        Pesaje inicial (bruto), pesaje final (tara), tara de camiones y datos de transporte.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tarjetaRol, styles.bordeLaboratorio]}
                    onPress={() => manejarSeleccion('laboratorio')}
                >
                    <Text style={styles.tituloRol}>Laboratorio</Text>
                    <Text style={styles.descripcionRol}>
                        Análisis de calidad: porcentaje de humedad, impurezas y grano rojo.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tarjetaRol, styles.bordeSupervisor]}
                    onPress={() => manejarSeleccion('supervisor')}
                >
                    <Text style={styles.tituloRol}>Supervisión</Text>
                    <Text style={styles.descripcionRol}>
                        Aprobación final, corrección de registros con motivo y auditoría de cola offline.
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.botonCerrarSesion} onPress={cerrarSesion}>
                <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    contenedorPrincipal: {
        flexGrow: 1,
        backgroundColor: '#F1F5F9',
        padding: 24,
        justifyContent: 'center',
    },
    encabezado: {
        marginBottom: 32,
        alignItems: 'center',
    },
    textoBienvenida: {
        fontSize: 16,
        color: '#64748B',
    },
    nombreUsuario: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 8,
    },
    instruccion: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
    },
    contenedorTarjetas: {
        gap: 16,
        marginBottom: 32,
    },
    tarjetaRol: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        borderLeftWidth: 6,
    },
    bordeRomana: {
        borderLeftColor: '#2563EB',
    },
    bordeLaboratorio: {
        borderLeftColor: '#D97706',
    },
    bordeSupervisor: {
        borderLeftColor: '#7C3AED',
    },
    tituloRol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 6,
    },
    descripcionRol: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
    },
    botonCerrarSesion: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    textoCerrarSesion: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default RoleSelectionScreen;