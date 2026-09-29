// src/components/StationHeader.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

interface StationHeaderProps {
    titulo: string;
    colorFondo?: string;
    sincronizando?: boolean;
    onAbrirMenu: () => void;
    onSincronizar: () => void;
}

/**
 * Componente de encabezado estandarizado para las pantallas de estaciones (Romana, Lab, Supervisión).
 */
export const StationHeader: React.FC<StationHeaderProps> = ({
    titulo,
    colorFondo = '#2563EB',
    sincronizando = false,
    onAbrirMenu,
    onSincronizar,
}) => {
    return (
        <View style={[styles.barraSuperior, { backgroundColor: colorFondo }]}>
            <TouchableOpacity style={styles.botonHamburguesa} onPress={onAbrirMenu}>
                <Text style={styles.textoHamburguesa}>☰</Text>
            </TouchableOpacity>

            <Text style={styles.tituloEstacion}>{titulo}</Text>

            <TouchableOpacity
                style={styles.botonSincronizar}
                onPress={onSincronizar}
                disabled={sincronizando}
            >
                <Text style={styles.textoBotonSincronizar}>
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    barraSuperior: {
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
    },
    textoBotonSincronizar: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});