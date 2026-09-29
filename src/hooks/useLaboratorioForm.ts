// src/hooks/useLaboratorioForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { RecepcionArroz } from '../types/recepcion';
import { SyncQueueService } from '../services/SyncQueueService';

export const useLaboratorioForm = () => {
    const { guardarRecepcion } = useRecepcion();

    const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<RecepcionArroz | null>(null);
    const [porcentajeHumedad, setPorcentajeHumedad] = useState<string>('');
    const [porcentajeImpureza, setPorcentajeImpureza] = useState<string>('');
    const [porcentajeGranoRojo, setPorcentajeGranoRojo] = useState<string>('');

    const seleccionarRegistro = (registro: RecepcionArroz) => {
        setRecepcionSeleccionada(registro);
        setPorcentajeHumedad(registro.porcentaje_humedad ? registro.porcentaje_humedad.toString() : '');
        setPorcentajeImpureza(registro.porcentaje_impureza ? registro.porcentaje_impureza.toString() : '');
        setPorcentajeGranoRojo(registro.porcentaje_grano_rojo ? registro.porcentaje_grano_rojo.toString() : '');
    };

    const limpiarFormulario = () => {
        setRecepcionSeleccionada(null);
        setPorcentajeHumedad('');
        setPorcentajeImpureza('');
        setPorcentajeGranoRojo('');
    };

    const manejarGuardar = async () => {
        if (!recepcionSeleccionada) {
            Alert.alert('Selección Requerida', 'Por favor seleccione una recepción de la lista para analizar.');
            return;
        }

        if (!porcentajeHumedad.trim() || !porcentajeImpureza.trim()) {
            Alert.alert('Campos Faltantes', 'Por favor ingrese al menos el % de humedad y % de impureza.');
            return;
        }

        const registroActualizado: RecepcionArroz = {
            ...recepcionSeleccionada,
            porcentaje_humedad: parseFloat(porcentajeHumedad),
            porcentaje_impureza: parseFloat(porcentajeImpureza),
            porcentaje_grano_rojo: porcentajeGranoRojo ? parseFloat(porcentajeGranoRojo) : 0,
            state: 'laboratorio',
        };

        try {
            await guardarRecepcion(registroActualizado);
            await SyncQueueService.enqueue('/api/recepcion/sincronizar', registroActualizado);

            Alert.alert(
                'Análisis Guardado',
                'Los datos del laboratorio se guardaron localmente y se añadieron a la cola de sincronización.'
            );
            limpiarFormulario();
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar ni encolar los análisis en la memoria local.');
        }
    };

    return {
        recepcionSeleccionada,
        form: {
            porcentajeHumedad,
            porcentajeImpureza,
            porcentajeGranoRojo,
        },
        setters: {
            setPorcentajeHumedad,
            setPorcentajeImpureza,
            setPorcentajeGranoRojo,
        },
        seleccionarRegistro,
        manejarGuardar,
    };
};