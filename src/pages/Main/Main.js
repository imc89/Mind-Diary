import React, { useState, useEffect, useCallback } from 'react';
// Importing React and the necessary hooks
// Importando React y los hooks necesarios

// COMPONENTS
// COMPONENTES
import Calendar from 'react-calendar';
// Importing Calendar component
// Importando el componente Calendar
import EntryContainer from '../../components/EntryContainer/EntryContainer';
// Importing EntryContainer component
// Importando el componente EntryContainer
import { userLocale } from '../../utils/utilsValues';
// Importing userLocale for date formatting
// Importando userLocale para el formato de fecha

// STYLES
// ESTILOS
import './Main.css';
// Importing the CSS for styling
// Importando el CSS para los estilos

const Main = () => {
    // ESTADO PARA LA FECHA SELECCIONADA EN EL CALENDARIO
    // STATE for the selected date in the calendar
    const [date, setDate] = useState(new Date());
    // ESTADO PARA ALMACENAR LAS ENTRADAS DEL DIARIO
    // STATE for storing diary entries
    const [entries, setEntries] = useState({});

    // FUNCIÓN PARA ABRIR LA BASE DE DATOS
    // FUNCTION to open the database
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('diaryDB', 1);
            // Open a connection to the IndexedDB 'diaryDB'
            // Abre una conexión con la base de datos IndexedDB 'diaryDB'

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // When upgrading the DB, create the 'entries' object store if it doesn't exist
                // Al actualizar la base de datos, crea el almacén de objetos 'entries' si no existe
                if (!db.objectStoreNames.contains('entries')) {
                    db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                    // Creates the 'entries' store with 'id' as the primary key
                    // Crea el almacén 'entries' con 'id' como clave primaria
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
                // If the request is successful, resolve the promise with the result
                // Si la solicitud es exitosa, resuelve la promesa con el resultado
            };

            request.onerror = (event) => {
                reject(event.target.error);
                // If an error occurs, reject the promise with the error
                // Si ocurre un error, rechaza la promesa con el error
            };
        });
    };

    // FUNCIÓN PARA OBTENER TODAS LAS ENTRADAS DE LA BASE DE DATOS
    // FUNCTION to fetch all entries from the database
    const fetchAllEntries = (db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();
            // Start a transaction to read from the 'entries' store
            // Inicia una transacción para leer del almacén 'entries'

            request.onsuccess = (event) => {
                resolve(event.target.result);
                db.close()
                // If the request is successful, resolve the promise with the result
                // Si la solicitud es exitosa, resuelve la promesa con el resultado
            };

            request.onerror = (event) => {
                reject(event.target.error);
                db.close()
                // If an error occurs, reject the promise with the error
                // Si ocurre un error, rechaza la promesa con el error
            };
            
        });
    };

    // Función para actualizar las entradas por día después de que se envíe una nueva entrada
    // FUNCTION to update the entries by day after a new entry is submitted
    const onEntrySubmit = useCallback(async () => {
        const db = await openDatabase();
        const allEntries = await fetchAllEntries(db);

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const daysInMonth = [];
        // Loop through the days of the month to generate the list of dates
        // Bucle a través de los días del mes para generar la lista de fechas
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            console.log(d)
            const entryDateString = new Date(d).toLocaleDateString(userLocale);
            daysInMonth.push(entryDateString);
            // Push each date of the month as a string in the correct locale format
            // Agrega cada fecha del mes como una cadena en el formato adecuado del locale
        }

        const entriesByDay = daysInMonth.reduce((acc, day) => {
            acc[day] = allEntries.some(entry => entry.date === day) ? 'has-entry' : '';
            // For each day, check if there is an entry and mark it with 'has-entry' if it exists
            // Para cada día, verifica si hay una entrada y marca con 'has-entry' si existe
            return acc;
        }, {});

        setEntries(entriesByDay);
        // Set the entries in the state with the entriesByDay object
        // Establece las entradas en el estado con el objeto entriesByDay
    }, [date]); // onEntrySubmit solo cambia cuando 'date' cambia
    // 'onEntrySubmit' only changes when 'date' changes

    // Cambiar la fecha seleccionada en el calendario
    // FUNCTION to change the selected date in the calendar
    const onDateChange = (newDate) => {
        setDate(newDate);
        // Update the state with the new selected date
        // Actualiza el estado con la nueva fecha seleccionada
    };

    // Para deshabilitar días sin entradas (si es necesario)
    // FUNCTION to disable days without entries (if needed)
    const tileDisabled = ({ date }) => {
        return date > new Date();
        // Disable future dates in the calendar
        // Deshabilita las fechas futuras en el calendario
    };

    useEffect(() => {
        onEntrySubmit(); // Llama a onEntrySubmit cuando el componente se monta o cambia 'date'
        // Call onEntrySubmit when the component mounts or the 'date' changes
        // Llama a onEntrySubmit cuando el componente se monta o cuando cambia 'date'
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependencias del hook: 'date' y 'onEntrySubmit'
    // Hook dependencies: 'date' and 'onEntrySubmit'

    return (
        <div>
            <div className="header">
                <h1>Mind Diary</h1>
                {/* Rendering the title */}
                {/* Renderizando el título */}
            </div>
            <Calendar
                onChange={onDateChange}
                value={date}
                showNeighboringMonth={false}
                tileClassName={({ date }) => {
                    const dateString = date.toLocaleDateString(userLocale);
                    return entries[dateString] || '';
                    // Add the class 'has-entry' to the tile if there is an entry for that date
                    // Agrega la clase 'has-entry' a la baldosa si hay una entrada para esa fecha
                }}
                tileDisabled={tileDisabled}
                // Disable certain dates based on the tileDisabled function
                // Deshabilitar ciertas fechas en función de la función tileDisabled
            />
            <EntryContainer date={date} onEntrySubmit={onEntrySubmit} />
            {/* Rendering the EntryContainer component with the selected date and submit function */}
            {/* Renderizando el componente EntryContainer con la fecha seleccionada y la función de envío */}
        </div>
    );
};

export default Main;
// Exporting the Main component to be used elsewhere
// Exportando el componente Main para ser utilizado en otros lugares
