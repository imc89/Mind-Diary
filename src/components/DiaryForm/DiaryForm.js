import React, { useState, useEffect } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import { userLocale } from '../../utils/utilsValues';

import './DiaryForm.css';

const DiaryForm = ({ date, onEntrySubmit }) => {
    // STATE FOR THE ENTRY TEXT
    // ESTADO PARA EL TEXTO DE LA ENTRADA
    const [entry, setEntry] = useState("");
    // STATE FOR THE IMAGE AND ITS PREVIEW
    // ESTADO PARA LA IMAGEN Y SU VISTA PREVIA
    const [image, setImage] = useState(null);


    useEffect(() => {
        // WE VERIFY IF INDEXEDDB IS COMPATIBLE WITH THE BROWSER
        // VERIFICAMOS SI INDEXEDDB ES COMPATIBLE CON EL NAVEGADOR
        if (!('indexedDB' in window)) {
            alert("¡IndexedDB no es compatible!");
        }
    }, []);
    // THE EMPTY DEPENDENCE [] ENSURES THAT USEEFFECT IS ONLY EXECUTED ONCE WHEN SETTING UP THE COMPONENT
    // LA DEPENDENCIA VACÍA [] ASEGURA QUE USEEFFECT SOLO SE EJECUTE UNA VEZ AL MONTAR EL COMPONENTE

    const handleSubmit = (e) => {
        // WE PREVENT THE DEFAULT BEHAVIOR OF THE FORM
        // PREVENIMOS EL COMPORTAMIENTO POR DEFECTO DEL FORMULARIO
        e.preventDefault();

        const newEntry = {
            // WE CONVERT THE DATE TO A toLocaleDateString DATE FORMAT.
            // CONVERTIMOS LA FECHA A UNA toLocaleDateString
            date: date.toLocaleDateString(userLocale),
            entry, // ENTRY TEXT // TEXTO DE LA ENTRADA
            image // IMAGE URL // URL DE LA IMAGEN
        };

        // WE OPEN THE "diaryDB" DATABASE WITH VERSION 1
        // ABRIMOS LA BASE DE DATOS "diaryDB" CON VERSIÓN 1
        const request = window.indexedDB.open('diaryDB', 1);

        // WE HANDLE THE ERROR WHEN OPENING THE MODAL DATABASE IF NECESSARY
        // MANEJAMOS EL ERROR AL ABRIR LA BASE DE DATOS MODAL SI ES NECESARIO
        request.onerror = (event) => {
            console.error('Error al abrir la base de datos:', event.target.errorCode);
        };

        // WE HANDLE SUCCESS WHEN OPENING THE DATABASE
        // MANEJAMOS EL ÉXITO AL ABRIR LA BASE DE DATOS
        request.onsuccess = (event) => {
            // WE GET THE DATABASE INSTANCE
            // OBTENEMOS LA INSTANCIA DE LA BASE DE DATOS
            const db = event.target.result;
            // WE START A TRANSACTION IN READING AND WRITING MODE
            // INICIAMOS UNA TRANSACCIÓN EN MODO DE LECTURA Y ESCRITURA
            const transaction = db.transaction(['entries'], 'readwrite');
            // WE GET THE DATABASE OF 'ENTRIES' OBJECTS
            // OBTENEMOS EL ALMACÉN DE OBJETOS 'ENTRIES'
            const objectStore = transaction.objectStore('entries');
            // WE ADD THE NEW ENTRANCE TO THE OBJECT DADATABASE
            // AGREGAMOS LA NUEVA ENTRADA AL ALMACÉN DE OBJETOS
            const addRequest = objectStore.add(newEntry);

            // WE HANDLE SUCCESS BY SAVING THE ENTRANCE
            // MANEJAMOS EL ÉXITO AL GUARDAR LA ENTRADA
            addRequest.onsuccess = () => {
                console.log('Entrada guardada correctamente.');
                // WE CLEAN THE STATUS OF THE TEXT INPUT
                // LIMPIAMOS EL ESTADO DE LA ENTRADA DE TEXTO
                setEntry('');
                // WE CLEAN THE STATUS OF THE IMAGE
                // LIMPIAMOS EL ESTADO DE LA IMAGEN
                setImage(null);
                // WE CALL THE ENTRY UPDATE FUNCTION IN THE PARENT
                // LLAMAMOS A LA FUNCIÓN DE ACTUALIZACIÓN DE ENTRADAS EN EL PADRE
                onEntrySubmit(newEntry);
            };

            // WE HANDLE THE ERROR BY SAVING THE ENTRANCE
            // MANEJAMOS EL ERROR AL GUARDAR LA ENTRADA
            addRequest.onerror = (event) => {
                console.error('Error al guardar la entrada:', event.target.errorCode);
            };
            // WE CLOSE THE DATABASE INSTANCE ONCE THE TRANSACTION IS COMPLETED
            // CERRAMOS LA INSTANCIA DE LA BASE DE DATOS UNA VEZ QUE LA TRANSACCIÓN SE COMPLETA
            transaction.oncomplete = () => db.close();
        };
    };

    const handleFileChange = (e) => {
        // WE VERIFY IF THERE IS A SELECTED FILE
        // VERIFICAMOS SI HAY UN ARCHIVO SELECCIONADO
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            // WE UPDATE THE STATUS OF THE IMAGE WITH THE URL GENERATED BY FILEREADER
            // ACTUALIZAMOS EL ESTADO DE LA IMAGEN CON LA URL GENERADA POR FILEREADER
            reader.onloadend = () => setImage(reader.result);
            // WE READ THE FILE AS A DATA URL
            // LEEMOS EL ARCHIVO COMO UNA URL DE DATOS
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="diary-form">
            <div className="header">
                <h2>Entrada para: {new Date(date).toLocaleDateString()}</h2>
            </div>
            <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Escribe tu entrada aquí..."
            ></textarea>
            <div className="file-upload">
                <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    id="image-upload"
                    onChange={handleFileChange}
                />
                <label htmlFor="image-upload" className="file-label">
                    <FaFileUpload className="upload-icon" /> Subir Imagen
                </label>
            </div>
            {image && (
                // IF THERE IS AN IMAGE FOR PREVIEW, WE SHOW IT
                // SI HAY UNA IMAGEN PARA VISTA PREVIA, LA MOSTRAMOS
                <div className="image-preview">
                    <img src={image} alt="Imagen de la entrada" className="uploaded-image" />
                </div>
            )}
            <button onClick={handleSubmit}>
                Guardar Entrada
            </button>

        </div>
    );
};

export default DiaryForm;
