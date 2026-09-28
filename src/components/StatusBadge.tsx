import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EstadoRecepcion } from '../types/recepcion';

interface StatusBadgeProps {
    estado: EstadoRecepcion;
}

/**
 * Componente visual para renderizar la etiqueta de estado de una recepcion.
 * Aplica colores diferenciados segun la etapa del proceso operativo.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
    /**
     * Obtiene la configuracion de texto y estilos segun el estado recibido.
     */
    const obtenerConfiguracionEstado = () => {
        switch (estado) {
            case 'pesaje_inicial':
                return {
                    texto: 'Peso Inicial',
                    estiloContenedor: styles.badgeAzul,
                    estiloTexto: styles.textoAzul,
                };
            case 'laboratorio':
                return {
                    texto: 'En Laboratorio',
                    estiloContenedor: styles.badgeNaranja,
                    estiloTexto: styles.textoNaranja,
                };
            case 'pesaje_final':
                return {
                    texto: 'Peso Final',
                    estiloContenedor: styles.badgeCeleste,
                    estiloTexto: styles.textoCeleste,
                };
            case 'completado':
                return {
                    texto: 'Completado',
                    estiloContenedor: styles.badgeVerde,
                    estiloTexto: styles.textoVerde,
                };
            case 'cancelado':
                return {
                    texto: 'Cancelado',
                    estiloContenedor: styles.badgeRojo,
                    estiloTexto: styles.textoRojo,
                };
            default:
                return {
                    texto: 'Desconocido',
                    estiloContenedor: styles.badgeGris,
                    estiloTexto: styles.textoGris,
                };
        }
    };

    const config = obtenerConfiguracionEstado();

    return (
        <View style={[styles.contenedorBase, config.estiloContenedor]}>
            <Text style={[styles.textoBase, config.estiloTexto]}>{config.texto}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    contenedorBase: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    textoBase: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    badgeAzul: {
        backgroundColor: '#DBEAFE',
    },
    textoAzul: {
        color: '#1E40AF',
    },
    badgeNaranja: {
        backgroundColor: '#FEF3C7',
    },
    textoNaranja: {
        color: '#92400E',
    },
    badgeCeleste: {
        backgroundColor: '#E0F2FE',
    },
    textoCeleste: {
        color: '#0369A1',
    },
    badgeVerde: {
        backgroundColor: '#DCFCE7',
    },
    textoVerde: {
        color: '#166534',
    },
    badgeRojo: {
        backgroundColor: '#FEE2E2',
    },
    textoRojo: {
        color: '#991B1B',
    },
    badgeGris: {
        backgroundColor: '#F1F5F9',
    },
    textoGris: {
        color: '#475569',
    },
});