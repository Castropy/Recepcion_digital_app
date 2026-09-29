// src/components/SyncStatusBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

interface SyncStatusBannerProps {
    isConnected: boolean | null;
    isSyncing: boolean;
    pendingCount: number;
    onSyncNow: () => void;
}

/**
 * Componente de barra superior que notifica al usuario sobre el estado de la red
 * y la existencia de datos pendientes por sincronizar en Odoo.
 */
export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
    isConnected,
    isSyncing,
    pendingCount,
    onSyncNow,
}) => {
    // Si hay conexión y no hay elementos pendientes ni proceso activo, no se renderiza nada
    if (isConnected && pendingCount === 0 && !isSyncing) {
        return null;
    }

    return (
        <View style={[styles.container, !isConnected ? styles.offlineBg : styles.syncBg]}>
            <View style={styles.content}>
                {!isConnected ? (
                    <Text style={styles.text}>
                        Modo Sin Conexión {pendingCount > 0 ? `(${pendingCount} pend. por sincronizar)` : ''}
                    </Text>
                ) : isSyncing ? (
                    <View style={styles.syncingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" style={styles.spinner} />
                        <Text style={styles.text}>Sincronizando con Odoo...</Text>
                    </View>
                ) : (
                    <Text style={styles.text}>
                        {pendingCount} registro{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de envio
                    </Text>
                )}

                {isConnected && !isSyncing && pendingCount > 0 && (
                    <TouchableOpacity style={styles.button} onPress={onSyncNow}>
                        <Text style={styles.buttonText}>Sincronizar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        width: '100%',
    },
    offlineBg: {
        backgroundColor: '#D32F2F', // Rojo para el estado Offline
    },
    syncBg: {
        backgroundColor: '#E65100', // Naranja/Ámbar para elementos pendientes
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    syncingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    spinner: {
        marginRight: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    button: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    buttonText: {
        color: '#E65100',
        fontSize: 12,
        fontWeight: '700',
    },
});