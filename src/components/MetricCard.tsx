import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MetricCardProps {
    titulo: string;
    valor: string | number;
    subtexto?: string;
    colorBorde?: string;
}

/**
 * Componente de tarjeta de metrica para mostrar indicadores clave en los dashboards.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
    titulo,
    valor,
    subtexto,
    colorBorde = '#2563EB',
}) => {
    return (
        <View style={[styles.tarjeta, { borderLeftColor: colorBorde }]}>
            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.valor}>{valor}</Text>
            {subtexto && <Text style={styles.subtexto}>{subtexto}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    tarjeta: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    titulo: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    valor: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
        marginVertical: 4,
    },
    subtexto: {
        fontSize: 10,
        color: '#94A3B8',
    },
});