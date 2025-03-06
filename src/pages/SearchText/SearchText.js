import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash } from 'react-icons/fa';
import './SearchText.css';


const SearchText = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [allEntries, setAllEntries] = useState([]);

    // Función que obtiene todas las entradas desde IndexedDB
    const fetchEntries = () => {
        const request = indexedDB.open('diaryDB', 1); // Ajusta el nombre y versión de tu base de datos

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const getAllRequest = store.getAll(); // Obtiene todas las entradas

            getAllRequest.onsuccess = () => {
                const allEntries = getAllRequest.result;
                setAllEntries(allEntries); // Guarda todas las entradas en el estado
            };

            getAllRequest.onerror = (event) => {
                console.error('Error al obtener las entradas:', event.target.error);
            };
        };

        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event.target.error);
        };
    };

    // Realiza la búsqueda filtrando las entradas
    const handleSearch = () => {
        if (searchQuery.trim() !== '') {
            const results = allEntries.filter(entry =>
                entry.entry.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredEntries(results); // Muestra las entradas que coinciden con la búsqueda
        } else {
            setFilteredEntries([]); // Si la búsqueda está vacía, no muestra nada
        }
    };

    // Detecta si se presiona la tecla Enter
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(); // Realiza la búsqueda al presionar Enter
        }
    };

    // Cargar todas las entradas al montar la página
    useEffect(() => {
        fetchEntries();
    }, []);

    // Elimina una entrada
    const handleDelete = (id) => {
        const request = indexedDB.open('diaryDB', 1); // Abre la base de datos

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction('entries', 'readwrite');
            const store = transaction.objectStore('entries');
            const deleteRequest = store.delete(id); // Elimina la entrada por su id

            deleteRequest.onsuccess = () => {
                // Eliminar la entrada localmente en el estado
                setFilteredEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
                setAllEntries(prevEntries => prevEntries.filter(entry => entry.id !== id)); // Eliminar también de allEntries
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
        <div className="search-text-container">
            <h1 className="title-search-text">Buscar Entradas</h1>


            {/* <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar texto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Actualiza el texto mientras el usuario escribe
                    onKeyPress={handleKeyPress} // Detecta la tecla Enter
                    className="search-input"
                />
                <button onClick={handleSearch} className="search-button">
                    <FaSearch />
                </button>
            </div> */}
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Buscar texto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} // Actualiza el texto mientras el usuario escribe
                    onKeyPress={handleKeyPress} // Detecta la tecla Enter
                    className="search-input"
                />

               <button onClick={handleSearch} className="search-button">
                    <FaSearch />
                </button>
            </div>

            <div className="entries-search-list">
                {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
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
                    <p className='no-found-search'>No se encontraron entradas que coincidan con la búsqueda.</p>
                )}
            </div>
        </div>
    );
};

export default SearchText;
