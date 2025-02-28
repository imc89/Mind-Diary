import React, { useState, useEffect } from 'react';
// OBTAIN THE REGIONAL CONFIGURATION OF THE USER FROM utilsValues
// OBTENER LA CONFIGURACIÓN REGIONAL DEL USUARIO DEL utilsValues
import { userLocale } from '../../utils/utilsValues';
// ICONS 
import { FaFileUpload } from 'react-icons/fa';
import { FaFaceSmile, FaFaceAngry, FaFaceFlushed, FaFaceFrown, FaFaceFrownOpen, FaFaceGrin, FaFaceGrinBeamSweat, FaFaceGrinHearts, FaFaceMeh, FaFaceSadTear } from "react-icons/fa6";
// COMPONENTS
import MoodTracker from '../MoodTracker/MoodTracker'

import vader from 'vader-sentiment';
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
    //
    //
    const [trackerPriority, setTrackerPriority] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
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


    const handleInputChange = (e) => {
        setEntry(e.target.value);

        if (typingTimeout) clearTimeout(typingTimeout);

        if (!e.target.value.trim()) {
            setMoodLabel('');
            setMoodColor('');
            console.log("entraaa")
            return;
        }

        setTypingTimeout(setTimeout(() => {
            if (e.target.value.trim()) {
                translation(e.target.value);
            }
        }, 800));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let mood = '';
            if (!trackerPriority) {
                mood = await translation(entry); // Esperamos el resultado de la traducción
            } else {
                mood = { 'label': moodLabel, 'color': moodColor }
            }

            const newEntry = {
                date: date.toLocaleDateString(userLocale),
                entry,
                moodLabel: mood.label, // Guardamos el mood de la traducción
                moodColor: mood.color,  // Guardamos el color del mood
                image
            };

            const request = window.indexedDB.open('diaryDB', 1);

            request.onerror = (event) => {
                console.error('Error al abrir la base de datos:', event.target.errorCode);
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['entries'], 'readwrite');
                const objectStore = transaction.objectStore('entries');
                const addRequest = objectStore.add(newEntry);

                addRequest.onsuccess = () => {
                    console.log('Entrada guardada correctamente.');
                    setEntry('');
                    setMoodLabel('');
                    setMoodColor('');
                    setImage(null);
                    setTrackerPriority(false);
                    onEntrySubmit(newEntry);
                };

                addRequest.onerror = (event) => {
                    console.error('Error al guardar la entrada:', event.target.errorCode);
                };

                transaction.oncomplete = () => db.close();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const objectStore = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('date', 'date', { unique: false });
            };
        } catch (error) {
            console.error("Error en la traducción antes de guardar:", error);
        }
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
        //
        setTrackerPriority(true)
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

    // Función para mapear la puntuación del sentimiento a un estado de ánimo
    const getMoodFromScore = (score) => {
        if (score <= -3) return { label: 'MUY MAL', color: '#8A2BE2' };   // Rojo oscuro
        if (score === -2) return { label: 'MAL', color: '#1E90FF' };     // Rojo anaranjado
        if (score === -1) return { label: 'ALGO MAL', color: '#4682B4' }; // Naranja
        if (score === 0) return { label: 'NORMAL', color: '#00BFFF' };   // Amarillo
        if (score === 1) return { label: 'ALGO BIEN', color: '#32CD32' }; // Verde amarillento
        if (score === 2) return { label: 'BIEN', color: '#FFD700' };     // Verde lima
        return { label: 'MUY BIEN', color: '#FF8C00' };                  // Verde oscuro
    };

    // Función para analizar el sentimiento usando VADER
    const analyzeSentimentWithVader = (text) => {
        const analysis = vader.SentimentIntensityAnalyzer.polarity_scores(text);
        const compoundScore = analysis.compound;

        let sentimentScore = 0;
        if (compoundScore <= -0.5) sentimentScore = -3;
        else if (compoundScore <= -0.2) sentimentScore = -2;
        else if (compoundScore < 0) sentimentScore = -1;
        else if (compoundScore === 0) sentimentScore = 0;
        else if (compoundScore <= 0.2) sentimentScore = 1;
        else if (compoundScore <= 0.5) sentimentScore = 2;
        else sentimentScore = 3;

        return getMoodFromScore(sentimentScore);
    };


    const translation = (entry) => {
        return new Promise((resolve, reject) => {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=${encodeURI(entry)}`;

            fetch(url)
                .then((response) => response.json())
                .then((json) => {
                    const translateResult = json[0].map((item) => item[0]).join("");
                    console.log("Texto original:", entry);
                    console.log("Traducción:", translateResult);

                    const mood = analyzeSentimentWithVader(translateResult);
                    console.log("SENTIMIENTO:", mood.label);

                    setMoodLabel(mood.label);
                    setMoodColor(mood.color);

                    resolve(mood); // Devolvemos el mood obtenido
                })
                .catch((error) => {
                    console.log("Error en la traducción:", error);
                    reject(error);
                });
        });
    };




    return (
        <div className="diary-form">
            <div className="header">
                <h2>Entrada para: {new Date(date).toLocaleDateString(userLocale)}</h2>
            </div>
            <div className="mood-container">
                <div className='mood-edit'>
                    <b>Editar estado de ánimo asignado: </b>
                    <button
                        className="mood-button"
                        onClick={handleOpenModal}
                        onMouseEnter={handleMouseEnter}
                    >
                        {renderIcon(faceIcon)}
                    </button>
                </div>

                <div
                    className="entry-color-indicator"
                    style={{ backgroundColor: moodColor || "#00BFFF" }}
                ></div>
            </div>
            <p className='mood-value'>{moodLabel}</p>  {/* Usar moodLabel en lugar de data.label */}

            {modalOpen && <MoodTracker onSave={handleSaveMood} onClose={handleCloseModal} />}

            <textarea
                value={entry}
                onChange={(e) => {
                    setEntry(e.target.value);
                    handleInputChange(e);
                }}
                placeholder="Escribe tu entrada aquí..."
            // onBlur={() => translation(entry)}
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
