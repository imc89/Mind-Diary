import React, { useState, useEffect } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import './DiaryForm.css';

const DiaryForm = ({ date }) => {
    const [entry, setEntry] = useState(""); // Estado para el texto de la entrada
    const [image, setImage] = useState(null); // Estado para la imagen y su vista previa

    useEffect(() => {
        if (!('indexedDB' in window)) { // Verificamos si IndexedDB es compatible con el navegador
            alert("¡IndexedDB no es compatible!");
        }
    }, []); // La dependencia vacía [] asegura que useEffect solo se ejecute una vez al montar el componente

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevenimos el comportamiento por defecto del formulario

        const newEntry = {
            date:  date.toLocaleDateString("en-CA"), // Convertimos la fecha a una cadena en formato ISO date.toLocaleDateString("en-CA")
            entry, // Texto de la entrada
            image // URL de la imagen
        };

        const request = window.indexedDB.open('diaryDB', 1); // Abrimos la base de datos "diaryDB" con versión 1

        request.onerror = (event) => { // Manejamos el error al abrir la base de datos MODAL SI ES NECESARIO
            console.error('Error al abrir la base de datos:', event.target.errorCode);
        };

        request.onsuccess = (event) => { // Manejamos el éxito al abrir la base de datos
            const db = event.target.result; // Obtenemos la instancia de la base de datos
            const transaction = db.transaction(['entries'], 'readwrite'); // Iniciamos una transacción en modo de lectura y escritura
            const objectStore = transaction.objectStore('entries'); // Obtenemos el almacén de objetos 'entries'
            const addRequest = objectStore.add(newEntry); // Agregamos la nueva entrada al almacén de objetos

            addRequest.onsuccess = () => { // Manejamos el éxito al guardar la entrada
                console.log('Entrada guardada correctamente.');
                setEntry(''); // Limpiamos el estado de la entrada de texto
                setImage(null); // Limpiamos el estado de la imagen
            };

            addRequest.onerror = (event) => { // Manejamos el error al guardar la entrada
                console.error('Error al guardar la entrada:', event.target.errorCode);
            };

            transaction.oncomplete = () => db.close(); // Cerramos la instancia de la base de datos una vez que la transacción se completa
        };

        request.onupgradeneeded = (event) => { // Configuración de la base de datos en caso de que necesite ser creada o actualizada
            const db = event.target.result;
            const objectStore = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true }); // Creamos el almacén de objetos 'entries'
            objectStore.createIndex('date', 'date', { unique: false }); // Creamos un índice en el campo 'date'
        };
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) { // Verificamos si hay un archivo seleccionado
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result); // Actualizamos el estado de la imagen con la URL generada por FileReader
            reader.readAsDataURL(file); // Leemos el archivo como una URL de datos
        }
    };

    return (
        <div className="diary-form">
            <div className="header">
                <h2>Entrada para: {new Date(date).toLocaleDateString()}</h2>
            </div>
            <textarea
                value={entry} // Asignamos el valor del estado de la entrada al textarea
                onChange={(e) => setEntry(e.target.value)} // Actualizamos el estado de la entrada al cambiar el valor del textarea
                placeholder="Escribe tu entrada aquí..."
            ></textarea>
            <div className="file-upload">
                <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    id="image-upload"
                    onChange={handleFileChange} // Manejamos el cambio de archivo
                />
                <label htmlFor="image-upload" className="file-label">
                    <FaFileUpload className="upload-icon" /> Subir Imagen
                </label>
            </div>
            {image && ( // Si hay una imagen para vista previa, la mostramos
                <div className="image-preview">
                    <img src={image} alt="Imagen de la entrada" className="uploaded-image" /> {/* Mostramos la vista previa de la imagen */}
                </div>
            )}
            <button onClick={handleSubmit}> {/* Asignamos la función handleSubmit al evento onClick del botón */}
                Guardar Entrada
            </button>

        </div>
    );
};

export default DiaryForm;
