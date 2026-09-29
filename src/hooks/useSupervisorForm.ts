// src/hooks/useSupervisorForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { RecepcionArroz } from '../types/recepcion';
import { SyncQueueService } from '../services/SyncQueueService';

export const useSupervisorForm = () => {
    const { guardarRecepcion } = useRecepcion();

    const [recepcionSeleccionada, setRecepcionSeleccionada] = useState<RecepcionArroz | null>(null);
    const [pesoBruto, setPesoBruto] = useState<string>('');
    const [porcentajeHumedad, setPorcentajeHumedad] = useState<string>('');
    const [motivoModificacion, setMotivoModificacion] = useState<string>('');

    const [modalAuditoriaVisible, setModalAuditoriaVisible] = useState<boolean>(false);
    const [recepcionAuditoria, setRecepcionAuditoria] = useState<RecepcionArroz | null>(null);

    const seleccionarRegistro = (registro: RecepcionArroz) => {
        setRecepcionSeleccionada(registro);
        setPesoBruto(registro.peso_bruto ? registro.peso_bruto.toString() : '');
        setPorcentajeHumedad(registro.porcentaje_humedad ? registro.porcentaje_humedad.toString() : '');
        setMotivoModificacion('');
    };

    const abrirAuditoria = (registro: RecepcionArroz) => {
        setRecepcionAuditoria(registro);
        setModalAuditoriaVisible(true);
    };

    const cerrarAuditoria = () => {
        setModalAuditoriaVisible(false);
        setRecepcionAuditoria(null);
    };

    const limpiarFormulario = () => {
        setRecepcionSeleccionada(null);
        setPesoBruto('');
        setPorcentajeHumedad('');
        setMotivoModificacion('');
    };

    const manejarAprobarOEditar = async (nuevoEstado: 'completado' | 'cancelado' | undefined) => {
        if (!recepcionSeleccionada) {
            Alert.alert('Selección Requerida', 'Por favor seleccione una recepción para supervisar.');
            return;
        }

        const brutoActual = parseFloat(pesoBruto) || 0;
        const humedadActual = parseFloat(porcentajeHumedad) || 0;
        const huboCambios =
            brutoActual !== (recepcionSeleccionada.peso_bruto || 0) ||
            humedadActual !== (recepcionSeleccionada.porcentaje_humedad || 0);

        if (huboCambios && !motivoModificacion.trim()) {
            Alert.alert(
                'Motivo Requerido',
                'Ha modificado valores del registro. Ingrese el motivo de la modificación por auditoría.'
            );
            return;
        }

        const registroActualizado: RecepcionArroz = {
            ...recepcionSeleccionada,
            peso_bruto: brutoActual,
            porcentaje_humedad: humedadActual,
            motivo_modificacion: motivoModificacion.trim() || undefined,
            fecha_modificacion_local: new Date().toISOString(),
            state: nuevoEstado || recepcionSeleccionada.state,
        };

        try {
            await guardarRecepcion(registroActualizado);
            await SyncQueueService.enqueue('/api/recepcion/sincronizar', registroActualizado);

            Alert.alert(
                'Registro Actualizado',
                'La recepción fue actualizada localmente y añadida a la cola de sincronización.'
            );
            limpiarFormulario();
        } catch (error) {
            Alert.alert('Error', 'No se pudieron actualizar ni encolar los datos del registro.');
        }
    };

    return {
        recepcionSeleccionada,
        recepcionAuditoria,
        modalAuditoriaVisible,
        form: {
            pesoBruto,
            porcentajeHumedad,
            motivoModificacion,
        },
        setters: {
            setPesoBruto,
            setPorcentajeHumedad,
            setMotivoModificacion,
        },
        seleccionarRegistro,
        abrirAuditoria,
        cerrarAuditoria,
        manejarAprobarOEditar,
    };
};