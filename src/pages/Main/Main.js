import React, { useState, useEffect } from 'react';
// COMPONENTS
// COMPONENTES
import Calendar from 'react-calendar';
import EntryContainer from '../../components/EntryContainer/EntryContainer';
// STYLES
// ESTILOS
import './Main.css';

const Main = () => {
    // Estado para la fecha seleccionada en el calendario
    // ESTADO PARA LA FECHA SELECCIONADA EN EL CALENDARIO
    const [date, setDate] = useState(new Date());
    // Estado para almacenar las entradas del diario
    // ESTADO PARA ALMACENAR LAS ENTRADAS DEL DIARIO
    const [entries, setEntries] = useState({});

    // Función para manejar el cambio de fecha en el calendario
    // FUNCIÓN PARA MANEJAR EL CAMBIO DE FECHA EN EL CALENDARIO
    const onDateChange = (newDate) => {
        setDate(newDate);
    };

    // Función para abrir la base de datos
    // FUNCIÓN PARA ABRIR LA BASE DE DATOS
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('diaryDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Crear un almacén de objetos llamado 'entries' si no existe
                // CREAR UN ALMACÉN DE OBJETOS LLAMADO 'ENTRIES' SI NO EXISTE
                if (!db.objectStoreNames.contains('entries')) {
                    db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };

    // Función para obtener todas las entradas de la base de datos
    // FUNCIÓN PARA OBTENER TODAS LAS ENTRADAS DE LA BASE DE DATOS
    const fetchAllEntries = (db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = (event) => {
                // Cuando la solicitud para abrir la base de datos es exitosa, resolver la promesa con el resultado
                // CUANDO LA SOLICITUD PARA ABRIR LA BASE DE DATOS ES EXITOSA, RESOLVER LA PROMESA CON EL RESULTADO
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                // Si ocurre un error al intentar abrir la base de datos, rechazar la promesa con el error
                // SI OCURRE UN ERROR AL INTENTAR ABRIR LA BASE DE DATOS, RECHAZAR LA PROMESA CON EL ERROR
                reject(event.target.error);
            };
        });
    };

    // Hook useEffect para obtener las entradas desde IndexedDB cuando el componente se monta o cuando las entradas cambian
    // HOOK USEEFFECT PARA OBTENER LAS ENTRADAS DESDE INDEXEDDB CUANDO EL COMPONENTE SE MONTA O CUANDO LAS ENTRADAS CAMBIAN
    useEffect(() => {
        const fetchEntries = async () => {
            // Abrir la base de datos
            // ABRIR LA BASE DE DATOS
            const db = await openDatabase();
            // Obtener todas las entradas
            // OBTENER TODAS LAS ENTRADAS
            const allEntries = await fetchAllEntries(db);
            // Obtener la configuración regional del usuario
            // OBTENER LA CONFIGURACIÓN REGIONAL DEL USUARIO
            const userLocale = navigator.language || navigator.userLanguage;

            // Obtener el primer y último día del mes actual
            // OBTENER EL PRIMER Y ÚLTIMO DÍA DEL MES ACTUAL
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            // Crear un array con todos los días del mes
            // CREAR UN ARRAY CON TODOS LOS DÍAS DEL MES
            const daysInMonth = [];
            for (let d = startOfMonth; d <= endOfMonth; d.setDate(d.getDate() + 1)) {
                const entryDateString = d.toLocaleDateString(userLocale);
                daysInMonth.push(entryDateString);
            }

            // Verificar si alguna entrada coincide con los días del mes
            // VERIFICAR SI ALGUNA ENTRADA COINCIDE CON LOS DÍAS DEL MES
            const entriesByDay = daysInMonth.reduce((acc, day) => {
                acc[day] = allEntries.some(entry => entry.date === day) ? 'has-entry' : '';
                return acc;
            }, {});

            // Actualizar el estado con las entradas por día
            // ACTUALIZAR EL ESTADO CON LAS ENTRADAS POR DÍA
            setEntries(entriesByDay);
        };

        fetchEntries();
    }, [date, entries]);
    // Se ejecuta cuando 'date' o 'entries' cambian
    // SE EJECUTA CUANDO 'DATE' O 'ENTRIES' CAMBIAN


    // Función para deshabilitar días futuros
    // FUNCIÓN PARA DESHABILITAR DÍAS FUTUROS
    const tileDisabled = ({ date }) => {
        // Si la fecha es mayor que la fecha actual, deshabilitar el día
        // SI LA FECHA ES MAYOR QUE LA FECHA ACTUAL, DESHABILITAR EL DÍA
        return date > new Date();
    };




    return (
        <div>
            <div className="header">
                <h1>Mind Diary</h1>
            </div>
            <Calendar
                // Función que se ejecuta cuando la fecha cambia
                // FUNCIÓN QUE SE EJECUTA CUANDO LA FECHA CAMBIA
                onChange={onDateChange}
                // Fecha actual seleccionada
                // FECHA ACTUAL SELECCIONADA
                value={date}
                // No mostrar los días del mes vecino
                // NO MOSTRAR LOS DÍAS DEL MES VECINO
                showNeighboringMonth={false}
                tileClassName={({ date, view }) => {
                    // Obtiene la configuración regional del navegador
                    // OBTIENE LA CONFIGURACIÓN REGIONAL DEL NAVEGADOR
                    const userLocale = navigator.language || navigator.userLanguage;
                    const dateString = date.toLocaleDateString(userLocale);
                    // Asignar clase 'has-entry' si hay una entrada en esa fecha
                    // ASIGNAR CLASE 'HAS-ENTRY' SI HAY UNA ENTRADA EN ESA FECHA
                    return entries[dateString] || '';
                }}
                // Llamar a la función para deshabilitar los días futuros
                // LLAMAR A LA FUNCIÓN PARA DESHABILITAR LOS DÍAS FUTUROS
                tileDisabled={tileDisabled}
            />
            <EntryContainer date={date} />
        </div>
    );
};

export default Main;
