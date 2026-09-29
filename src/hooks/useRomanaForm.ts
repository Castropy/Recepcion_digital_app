// src/hooks/useRomanaForm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { useRecepcion } from '../context/RecepcionContext';
import { RecepcionArroz, VariedadArroz } from '../types/recepcion';
import { SyncQueueService } from '../services/SyncQueueService';

export const useRomanaForm = () => {
    const { guardarRecepcion } = useRecepcion();

    const [partnerId, setPartnerId] = useState<string>('');
    const [guiaSica, setGuiaSica] = useState<string>('');
    const [variedad, setVariedad] = useState<VariedadArroz>('fl_supa');
    const [vehiculoPlaca, setVehiculoPlaca] = useState<string>('');
    const [choferCedula, setChoferCedula] = useState<string>('');
    const [choferNombre, setChoferNombre] = useState<string>('');
    const [pesoBruto, setPesoBruto] = useState<string>('');
    const [pesoTara, setPesoTara] = useState<string>('');

    const brutoNum = parseFloat(pesoBruto) || 0;
    const taraNum = parseFloat(pesoTara) || 0;
    const pesoNeto = brutoNum > taraNum ? brutoNum - taraNum : 0;

    const reiniciarFormulario = () => {
        setPartnerId('');
        setGuiaSica('');
        setVehiculoPlaca('');
        setChoferCedula('');
        setChoferNombre('');
        setPesoBruto('');
        setPesoTara('');
    };

    const manejarGuardar = async () => {
        if (!partnerId.trim() || !guiaSica.trim() || !vehiculoPlaca.trim() || !pesoBruto.trim()) {
            Alert.alert('Campos Faltantes', 'Por favor complete el Productor, Guía SICA, Placa y Peso Bruto.');
            return;
        }

        const nuevaRecepcion: RecepcionArroz = {
            state: pesoTara ? 'pesaje_final' : 'pesaje_inicial',
            date_recepcion: new Date().toISOString(),
            partner_id: partnerId.trim(),
            guia_sica: guiaSica.trim(),
            variedad_arroz: variedad,
            vehiculo_placa: vehiculoPlaca.trim().toUpperCase(),
            chofer_cedula: choferCedula.trim(),
            chofer_nombre: choferNombre.trim(),
            peso_bruto: brutoNum,
            peso_tara: taraNum > 0 ? taraNum : undefined,
            peso_neto: pesoNeto > 0 ? pesoNeto : undefined,
        };

        try {
            await guardarRecepcion(nuevaRecepcion);
            await SyncQueueService.enqueue('/api/recepcion/sincronizar', nuevaRecepcion);

            Alert.alert(
                'Registro Exitoso',
                'La recepción se guardó localmente y se ha añadido a la cola de sincronización.'
            );
            reiniciarFormulario();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la recepción ni encolarla en la memoria local.');
        }
    };

    return {
        form: {
            partnerId,
            guiaSica,
            variedad,
            vehiculoPlaca,
            choferCedula,
            choferNombre,
            pesoBruto,
            pesoTara,
            pesoNeto,
        },
        setters: {
            setPartnerId,
            setGuiaSica,
            setVariedad,
            setVehiculoPlaca,
            setChoferCedula,
            setChoferNombre,
            setPesoBruto,
            setPesoTara,
        },
        manejarGuardar,
    };
};