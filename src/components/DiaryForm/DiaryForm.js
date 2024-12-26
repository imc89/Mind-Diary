import React, { useState, useEffect } from 'react';
// OBTAIN THE REGIONAL CONFIGURATION OF THE USER FROM utilsValues
// OBTENER LA CONFIGURACIÓN REGIONAL DEL USUARIO DEL utilsValues
import { userLocale } from '../../utils/utilsValues';
// ICONS 
import { FaFileUpload } from 'react-icons/fa';
import { FaFaceSmile, FaFaceAngry, FaFaceFlushed, FaFaceFrown, FaFaceFrownOpen, FaFaceGrin, FaFaceGrinBeamSweat, FaFaceGrinHearts, FaFaceMeh, FaFaceSadTear } from "react-icons/fa6";
// COMPONENTS
import MoodTracker from '../MoodTracker/MoodTracker'

import './DiaryForm.css';

const DiaryForm = ({ date, onEntrySubmit }) => {
    // STATE FOR THE ENTRY TEXT
    // ESTADO PARA EL TEXTO DE LA ENTRADA
    const [entry, setEntry] = useState("");
    // STATE FOR THE IMAGE AND ITS PREVIEW
    // ESTADO PARA LA IMAGEN Y SU VISTA PREVIA
    const [image, setImage] = useState(null);
    // STATE FOR MOOD AND ASSOCIATED COLOR
    // ESTADO PARA EL HUMOR Y COLOR ASOCIADO
    const [moodLabel, setMoodLabel] = useState('');
    const [moodColor, setMoodColor] = useState('');
    // STATE TO CHANGE THE MOOD BUTTON ICON
    // ESTADO PARA CAMBIAR EL ICONO DEL BOTON MOOD
    const [faceIcon, setFaceIcon] = useState('FaFaceSmile');
    // ICONS TO CHANGE WHEN THE CURSOR PASSES OVER THE MOOD BUTTON
    // ICONOS A CAMBIAR CUANDO EL CURSOR PASA POR ENCIMA DEL BOTON DE MOOD
    const faces = ['FaFaceSmile', 'FaFaceAngry', 'FaFaceFlushed', 'FaFaceFrown', 'FaFaceFrownOpen', 'FaFaceGrin', 'FaFaceGrinBeamSweat', 'FaFaceGrinHearts', 'FaFaceMeh', 'FaFaceSadTear'];


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
            moodLabel, // MOOD LABEL
            moodColor,  // MOOD COLOR
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
                // WE CLEAN THE STATUS OF THE MOOD 
                // LIMPIAMOS EL ESTADO DEL MOOD 
                setMoodLabel('');
                // WE CLEAN THE STATUS OF THE COLOR MOOD 
                // LIMPIAMOS EL ESTADO DEL COLOR DEL MOOD 
                setMoodColor('');
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

        // CONTINGENCY METHOD TO CREATE THE BBDD 'ENTRIES' IN CASE IT IS DELETED BY HAND AT THE INIT OF THE APPLICATION
        // METODO DE CONTINGENCIA PARA CREAR LA BBDD 'ENTRIES' EN CASO DE QUE SE BORRE A MANO AL INICIAR LA APLICACION
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // WE CREATE THE WAREHOUSE OF 'ENTRIES' OBJECTS
            // CREAMOS EL ALMACÉN DE OBJETOS 'ENTRIES'
            const objectStore = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
            // WE CREATE AN INDEX IN THE 'DATE' FIELD
            // CREAMOS UN ÍNDICE EN EL CAMPO 'DATE'
            objectStore.createIndex('date', 'date', { unique: false });
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

    // MOOD
    const [modalOpen, setModalOpen] = useState(false);

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleSaveMood = (mood) => {
        console.log('Mood saved:', mood);
         // Guardamos el label del mood
        setMoodLabel(mood.label);  
        // Guardamos el color del mood
        setMoodColor(mood.color);   
         // Cerrar la modal
        handleCloseModal() 
    };

    // METODO DE CIERRE DE LA MODAL
    const handleCloseModal = () => {
        setModalOpen(false);
    };
    
    // METODO PARA CAMBIAR EL ICONO DE LA CARA EN EL BOTON DE ABRIR MODAL MOOD
    const handleMouseEnter = () => {
        const randomIndex = Math.floor(Math.random() * faces.length);
        setFaceIcon(faces[randomIndex]);
    };

    // Crear el ícono dinámicamente
    const renderIcon = (iconName) => {
        const IconComponent = {
            FaFaceSmile: FaFaceSmile,
            FaFaceAngry: FaFaceAngry,
            FaFaceFlushed: FaFaceFlushed,
            FaFaceFrown: FaFaceFrown,
            FaFaceFrownOpen: FaFaceFrownOpen,
            FaFaceGrin: FaFaceGrin,
            FaFaceGrinBeamSweat: FaFaceGrinBeamSweat,
            FaFaceGrinHearts: FaFaceGrinHearts,
            FaFaceMeh: FaFaceMeh,
            FaFaceSadTear: FaFaceSadTear
        }[iconName];
        return <IconComponent />;
    };


    return (
        <div className="diary-form">
            <div className="header">
                <h2>Entrada para: {new Date(date).toLocaleDateString()}</h2>
            </div>
            <div className="mood-container">
                <button
                    className="mood-button"
                    onClick={handleOpenModal}
                    onMouseEnter={handleMouseEnter}
                >
                    {renderIcon(faceIcon)}
                </button>
                <div className="mood-box" style={{ backgroundColor: moodColor }}></div>
            </div>
            <p className='mood-value'>{moodLabel}</p>  {/* Usar moodLabel en lugar de data.label */}

            {modalOpen && <MoodTracker onSave={handleSaveMood} onClose={handleCloseModal} />}

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
            <button className="form-button" onClick={handleSubmit}>
                Guardar Entrada
            </button>

        </div>
    );
};

export default DiaryForm;
