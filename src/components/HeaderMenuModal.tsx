// src/components/HeaderMenuModal.tsx
import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface HeaderMenuModalProps {
    visible: boolean;
    onClose: () => void;
}

/**
 * Componente modal lateral de navegación / perfil.
 * Despliega los datos del usuario autenticado, su rol activo y la opción de cerrar sesión.
 */
export const HeaderMenuModal: React.FC<HeaderMenuModalProps> = ({ visible, onClose }) => {
    const { user, userRole, cerrarSesion, seleccionarRol } = useAuth();

    const handleCerrarSesion = () => {
        onClose();
        cerrarSesion();
    };

    const handleCambiarRol = () => {
        onClose();
        seleccionarRol(null as any);
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.contenidoMenu}>
                            {/* Encabezado Perfil */}
                            <View style={styles.seccionPerfil}>
                                <View style={styles.avatar}>
                                    <Text style={styles.textoAvatar}>
                                        {user?.nombre ? user.nombre.substring(0, 2).toUpperCase() : 'RD'}
                                    </Text>
                                </View>
                                <Text style={styles.nombreUsuario}>
                                    {user?.nombre || 'Operador Odoo'}
                                </Text>
                                <Text style={styles.cedulaUsuario}>
                                    {user?.cedula ? `C.I: ${user.cedula}` : 'Recepción Digital'}
                                </Text>
                                <View style={styles.badgeRol}>
                                    <Text style={styles.textoBadgeRol}>
                                        ROL: {userRole ? userRole.toUpperCase() : 'SIN ROL'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divisor} />

                            {/* Opciones de Navegación Futura */}
                            <View style={styles.seccionOpciones}>
                                <TouchableOpacity style={styles.opcionMenu} onPress={handleCambiarRol}>
                                    <Text style={styles.iconoOpcion}>🔄</Text>
                                    <Text style={styles.textoOpcion}>Cambiar Estación / Rol</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Botón de Cierre de Sesión */}
                            <TouchableOpacity style={styles.botonCerrarSesion} onPress={handleCerrarSesion}>
                                <Text style={styles.iconoCerrarSesion}>🚪</Text>
                                <Text style={styles.textoCerrarSesion}>Cerrar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    contenidoMenu: {
        width: '75%',
        height: '100%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        elevation: 5,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        justifyContent: 'space-between',
    },
    seccionPerfil: {
        alignItems: 'center',
        marginTop: 30,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    textoAvatar: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    nombreUsuario: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'center',
    },
    cedulaUsuario: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    badgeRol: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    textoBadgeRol: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#1D4ED8',
    },
    divisor: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 15,
    },
    seccionOpciones: {
        flex: 1,
    },
    opcionMenu: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    iconoOpcion: {
        fontSize: 18,
        marginRight: 12,
    },
    textoOpcion: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    botonCerrarSesion: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        marginBottom: 10,
    },
    iconoCerrarSesion: {
        fontSize: 16,
        marginRight: 8,
    },
    textoCerrarSesion: {
        color: '#DC2626',
        fontWeight: 'bold',
        fontSize: 14,
    },
});