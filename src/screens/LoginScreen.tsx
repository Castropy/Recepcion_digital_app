import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

/**
 * Pantalla de inicio de sesion para autenticacion de operadores.
 * Permite el ingreso mediante usuario/cedula y contrasena contra el backend Odoo.
 */
const LoginScreen: React.FC = () => {
    const [login, setLogin] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [cargandoEnvio, setCargandoEnvio] = useState<boolean>(false);

    const { iniciarSesion } = useAuth();

    /**
     * Procesa el intento de inicio de sesion invocando el metodo del contexto.
     */
    const manejarIngreso = async () => {
        if (!login.trim() || !password.trim()) {
            Alert.alert('Campos Incompletos', 'Por favor ingrese su cédula/usuario y contraseña.');
            return;
        }

        setCargandoEnvio(true);
        try {
            const resultado = await iniciarSesion(login.trim(), password.trim());
            if (!resultado.exito) {
                Alert.alert('Error de Autenticación', resultado.mensaje || 'Credenciales inválidas.');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un fallo inesperado durante el ingreso.');
        } finally {
            setCargandoEnvio(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.contenedorPrincipal}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.tarjetaLogin}>
                <Text style={styles.tituloApp}>Recepción Digital</Text>
                <Text style={styles.subtituloApp}>Control de Arroz Paddy</Text>

                <View style={styles.grupoCampo}>
                    <Text style={styles.etiquetaCampo}>Usuario / Cédula</Text>
                    <TextInput
                        style={styles.entradaTexto}
                        placeholder="Ingrese su usuario"
                        placeholderTextColor="#888"
                        value={login}
                        onChangeText={setLogin}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.grupoCampo}>
                    <Text style={styles.etiquetaCampo}>Contraseña</Text>
                    <TextInput
                        style={styles.entradaTexto}
                        placeholder="Ingrese su contraseña"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.botonIngreso, cargandoEnvio && styles.botonDeshabilitado]}
                    onPress={manejarIngreso}
                    disabled={cargandoEnvio}
                >
                    {cargandoEnvio ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.textoBotonIngreso}>Iniciar Sesión</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    tarjetaLogin: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    tituloApp: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0F172A',
        textAlign: 'center',
    },
    subtituloApp: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 24,
    },
    grupoCampo: {
        marginBottom: 16,
    },
    etiquetaCampo: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 6,
    },
    entradaTexto: {
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
    },
    botonIngreso: {
        backgroundColor: '#16A34A',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
    },
    botonDeshabilitado: {
        backgroundColor: '#86EFAC',
    },
    textoBotonIngreso: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginScreen;