import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './Preview.css';
import { userLocale } from '../../utils/utilsValues';

const Preview = ({ date, entries, deleteEntry }) => {
    // Convert the selected date to a string format for searching in the entries
    // Convierte la fecha seleccionada a un formato de cadena para buscar en las entradas
    const selectedDate = new Date(date).toLocaleDateString(userLocale)

    // State to store the entries for the selected date
    // Estado para almacenar las entradas de la fecha seleccionada
    const [dailyEntries, setDailyEntries] = useState([]);

    // Function to open the IndexedDB database
    // Función para abrir la base de datos IndexedDB
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('diaryDB', 1);
            // Resolve the database connection on success
            // Resuelve la conexión a la base de datos si es exitosa
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            // Reject the promise if an error occurs
            // Rechaza la promesa si ocurre un error
            request.onerror = (event) => {
                reject(event.target.error);
            };
            // Handle database upgrades
            // Maneja las actualizaciones de la base de datos
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create the 'entries' object store if it doesn't exist
                // Crea el almacén de objetos 'entries' si no existe
                if (!db.objectStoreNames.contains('entries')) {
                    db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    };

    // Function to fetch all entries from the database
    // Función para obtener todas las entradas de la base de datos
    const fetchAllEntries = (db) => {
        return new Promise((resolve, reject) => {
            // Start a readonly transaction
            // Inicia una transacción de solo lectura
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            // Resolve the promise with all entries on success
            // Resuelve la promesa con todas las entradas si es exitosa
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            // Reject the promise if an error occurs
            // Rechaza la promesa si ocurre un error
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    };

    // Effect to fetch and filter entries for the selected date
    // Efecto para obtener y filtrar las entradas de la fecha seleccionada
    useEffect(() => {
        const updatePreview = async () => {
            try {
                // Open the database
                // Abre la base de datos
                const db = await openDatabase();
                // Fetch all entries
                // Obtén todas las entradas
                const allEntries = await fetchAllEntries(db);

                if (allEntries && allEntries.length > 0) {
                    // Filter entries that match the selected date
                    // Filtra las entradas que coinciden con la fecha seleccionada
                    const filteredEntries = allEntries.filter(entry => {
                           // Split the date and rearrange to the desired format
                        // Divide la fecha y reorganiza al formato deseado
                        const [day, month, year] = entry.date.split('/').map(Number);
                        let entryDate = new Date(year, month - 1, day).toLocaleDateString(userLocale);; // Meses en JavaScript son 0-11

                        // let entryDate = new Date(entry.date).toLocaleDateString(userLocale);
                   
                        return entryDate === selectedDate;
                    });
                    // Update the state with the filtered entries
                    // Actualiza el estado con las entradas filtradas
                    setDailyEntries(filteredEntries);
                } else {
                    console.log('No entries found.');
                    // Clean the State, indicating that there are no tickets for the selected date
                    // Limpia el estado, indicando que no hay entradas para la fecha seleccionada
                    setDailyEntries([]);
                }
                // Close the database connection
                // Cierra la conexión a la base de datos
                db.close();
            } catch (error) {
                console.error('Error fetching entries:', error);
            }
        };

        updatePreview();
        // 'ONENTRYSUBMIT' ONLY CHANGES WHEN 'selectedDate' OR 'entries' CHANGES
        // ONENTRYSUBMIT SOLO CAMBIA CUANDO 'selectedDate' O 'entries' CAMBIAN
    }, [selectedDate, entries]);

    return (
        <div className="preview-container">
            <h3>Entradas para {selectedDate}</h3>
            {dailyEntries.length > 0 ? (
                dailyEntries.map((entry) => (
                    <div key={entry.id} className="entry-preview">
                        <h4 id="entry-title">ENTRADA</h4>
                        <p>{entry.entry.charAt(0).toUpperCase() + entry.entry.slice(1) || "Sin texto para esta entrada"}</p>
                        {entry.image && (
                            <img
                                src={entry.image}
                                alt="Imagen adjunta"
                                className="preview-image"
                            />
                        )}
                         <h4>Este día te sentías : {entry.moodLabel || "NORMAL"}</h4>
                        <div
                            className="entry-color-indicator"
                            style={{ backgroundColor: entry.moodColor || "#00BFFF" }}
                        ></div>
                        <button
                            onClick={() => deleteEntry(entry.id, selectedDate)}
                            className="delete-button"
                        >
                            <FaTrash id='delete-icon'/>
                            <span id="delete-text">Eliminar</span>
                        </button>
                    </div>
                ))
            ) : (
                <p>No hay entradas para este día.</p>
            )}
        </div>
    );
};

export default Preview;
