import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import './SearchImages.css'

import { userLocale } from '../../utils/utilsValues';


const SearchImages = () => {
    const [entriesWithImages, setEntriesWithImages] = useState([]);

    // Function to fetch entries with images from the IndexedDB
    const fetchEntriesWithImages = () => {
        const request = indexedDB.open('diaryDB', 1); // Ajusta el nombre y versión de tu base de datos

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const getAllRequest = store.getAll(); // Obtiene todas las entradas

            getAllRequest.onsuccess = () => {
                const allEntries = getAllRequest.result;
                // Filtrar las entradas que tengan imágenes
                const entriesWithImages = allEntries.filter(entry => entry.image);
                setEntriesWithImages(entriesWithImages);
            };

            getAllRequest.onerror = (event) => {
                console.error('Error al obtener las entradas:', event.target.error);
            };
        };

        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event.target.error);
        };
    };

    useEffect(() => {
        fetchEntriesWithImages();
    }, []);

    const handleDelete = (id) => {
        const request = indexedDB.open('diaryDB', 1); // Abre la base de datos

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('entries', 'readwrite');
            const store = transaction.objectStore('entries');
            const deleteRequest = store.delete(id); // Elimina la entrada por su id

            deleteRequest.onsuccess = () => {
                // Eliminar la entrada localmente en el estado
                setEntriesWithImages(prevEntries => prevEntries.filter(entry => entry.id !== id));
            };

            deleteRequest.onerror = (event) => {
                console.error('Error al eliminar la entrada:', event.target.error);
            };
        };

        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event.target.error);
        };
    };

    return (
        <div className="search-images-container">
            <h1 className="title-search-image">Entradas con Imágenes</h1>
            <div className="entries-list">
                {entriesWithImages.length > 0 ? (
                    entriesWithImages.map((entry) => (
                        <div key={entry.id} className="entry-card">
                            <h3>{entry.date}</h3>
                            <p>{entry.entry}</p>
                            {entry.image && <img src={entry.image} alt="Imagen de la entrada" className="entry-image" />}
                            <button onClick={() => handleDelete(entry.id)} className="delete-button">
                                <FaTrash />
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No hay entradas con imágenes.</p>
                )}
            </div>
        </div>
    );
};

export default SearchImages;
