import React, { useState, useEffect } from 'react';

// OBTAIN THE REGIONAL CONFIGURATION OF THE USER FROM utilsValues
// OBTENER LA CONFIGURACIÓN REGIONAL DEL USUARIO DEL utilsValues
import { userLocale } from '../../utils/utilsValues';

// ICONS 
import { FaFileUpload } from 'react-icons/fa';
import { FaFaceSmile, FaFaceAngry, FaFaceFlushed, FaFaceFrown, FaFaceFrownOpen, FaFaceGrin, FaFaceGrinBeamSweat, FaFaceGrinHearts, FaFaceMeh, FaFaceSadTear } from "react-icons/fa6";

// COMPONENTS
import MoodTracker from '../MoodTracker/MoodTracker'

// IMPORTING AXIOS FOR MAKING HTTP REQUESTS
// IMPORTANDO AXIOS PARA REALIZAR PETICIONES HTTP
import axios from 'axios';

// IMPORTING VADER SENTIMENT ANALYZER FOR TEXT SENTIMENT ANALYSIS
// IMPORTANDO VADER SENTIMENT ANALYZER PARA EL ANÁLISIS DE SENTIMIENTOS DEL TEXTO
import vader from 'vader-sentiment';

//STYLES
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
    //MODALS
    const [modalOpen, setModalOpen] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    // GEMINI AI ICON
    const [aiIconSrc, setAiIconSrc] = useState(`${process.env.PUBLIC_URL}/icon/AI/ai-white.png`);
    // GEMINI AI SPINNER WAITING
    const [showAiSpinner, setShowAiSpinner] = useState(true);  // Nuevo estado para controlar la imagen

    // GEMINI AI ANSWER
    const [aiAnswer, setAiAnswer] = useState('');

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

    // MODALS

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    // METODO DE CIERRE DE LA MODAL
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    // Función para abrir la modal AI
    const openAiModal = () => {
        setAiAnswer('');  // Limpiar la respuesta de la IA antes de mostrar la imagen
        setShowAiSpinner(true);  // Mostrar la imagen AI
        askGemini();  // Llamar al método para obtener la respuesta de la IA

        // Después de 5 segundos, mostramos la respuesta de la IA
        setTimeout(() => {
            setShowAiSpinner(false);  // Dejar de mostrar la imagen y mostrar la respuesta
        }, 5000);

        setAiModalOpen(true);  // Abrir la modal
    };

    // Función para cerrar la modal AI
    const closeAiModal = () => {
        setAiModalOpen(false);
    };


    // MOOD
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


    // METHOD THAT RETURNS ONE OF THE ICONS FROM faces RANDOMLY
    // MÉTODO QUE DEVUELVE UNO DE LOS ICONOS DE faces ALEATORIAMENTE
    const handleMouseEnter = () => {
        const randomIndex = Math.floor(Math.random() * faces.length);
        setFaceIcon(faces[randomIndex]);
    };

    // METHOD THAT PAINTS THE ICON GENERATED RANDOMLY BY handleMouseEnter
    // MÉTODO QUE PINTA EL ICONO GENERADO ALEATORIAMENTE POR handleMouseEnter
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

    // FUNCTION TO MAP THE SCORE OF FEELING TO A MOOD
    // FUNCIÓN PARA MAPEAR LA PUNTUACIÓN DEL SENTIMIENTO A UN ESTADO DE ÁNIMO
    const getMoodFromScore = (score) => {
        if (score <= -3) return { label: 'MUY MAL', color: '#8A2BE2' };   // Rojo oscuro
        if (score === -2) return { label: 'MAL', color: '#1E90FF' };     // Rojo anaranjado
        if (score === -1) return { label: 'ALGO MAL', color: '#4682B4' }; // Naranja
        if (score === 0) return { label: 'NORMAL', color: '#00BFFF' };   // Amarillo
        if (score === 1) return { label: 'ALGO BIEN', color: '#32CD32' }; // Verde amarillento
        if (score === 2) return { label: 'BIEN', color: '#FFD700' };     // Verde lima
        return { label: 'MUY BIEN', color: '#FF8C00' };                  // Verde oscuro
    };

    // FUNCTION TO ANALYZE THE FEELING USING VADER
    // FUNCIÓN PARA ANALIZAR EL SENTIMIENTO USANDO VADER
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


    const askGemini = async () => {
        const text = document.querySelector("#root > div > div.entry-container > div.diary-form > textarea").value;
        const lang = window.localStorage.getItem('lang');

        // Declara la constante promptText 
        const promptText = lang === 'es'
            ? `Texto: "${text}"\nPregunta: ¿explicame los sentimientos que inspira el texto?`
            : `Text: "${text}"\nQuestion: Can you explain the feelings inspired by this text?`;


        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: promptText,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        candidateCount: 1,
                    },
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const geminiResponse = response.data.candidates[0].content.parts[0].text;
            setAiAnswer(geminiResponse)
            // console.log("Respuesta de Gemini:", geminiResponse);
        } catch (error) {
            console.error("Error al llamar a Gemini:", error.response?.data || error.message);
        }
    };

    // CALL TO GOOGLEAPIS TO TRANSLATE THE TEXT THAT WILL BE ANALYZED BY VADER
    // LLAMADA A GOOGLEAPIS PARA TRADUCIR EL TEXTO QUE SERÁ ANALIZADO POR VADER
    const translation = (entry) => {
        return new Promise((resolve, reject) => {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=en&dt=t&q=${encodeURI(entry)}`;

            fetch(url)
                .then((response) => response.json())
                .then((json) => {
                    const translateResult = json[0].map((item) => item[0]).join("");
                    // console.log("Texto original:", entry);
                    // console.log("Traducción:", translateResult);

                    const mood = analyzeSentimentWithVader(translateResult);
                    // console.log("SENTIMIENTO:", mood.label);

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

    // METHOD TO FORMAT GEMINI'S RESPONSES THROUGH REGEX
    // MÉTODO PARA DAR FORMATO A LAS RESPUESTAS DE GEMINI A TRAVÉS DE REGEX
    const formatAiAnswer = (text) => {

        // REPLACE * WITH <li>TEXT</li> 
        // REEMPLAZAR * POR <li>TEXTO</li> 
        text = text.replace(/^\*\s+(.*)$/gm, (match, p1) => `<li>${p1}</li>`);

        // CONVERT LINE JUMPS INTO PARAGRAPHS
        // CONVERTIR SALTOS DE LÍNEA EN PÁRRAFOS
        text = text.replace(/([^\n]*\n?)/g, (match) => `<p>${match.trim()}</p>`);

        // REMOVE EXTRA LINE JUMPS
        // ELIMINAR SALTOS DE LÍNEA EXTRA
        text = text.replace(/\n{2,}/g, '\n');

        // REPLACE ** TEXT ** WITH <b>TEXT</b>
        // REEMPLAZAR **TEXTO** POR <b>TEXTO</b>
        text = text.replace(/\*\*([^\*]+)\*\*/g, (match, p1) => `<b>${p1}</b>`);

        return text;
    }



    return (
        <div className="diary-form">
            <div
                className='ai-analyzer'
                onMouseOver={() => setAiIconSrc(`${process.env.PUBLIC_URL}/icon/AI/ai-white.gif`)}
                onMouseOut={() => setAiIconSrc(`${process.env.PUBLIC_URL}/icon/AI/ai-white.png`)}
            >
                <p className='ai-analyzer-text'> PULSA SI DESEAS ANALIZAR TU DÍA &#8594; </p>
                <img className='ai-analyzer-img' src={aiIconSrc} alt="AI Analyzer" onClick={openAiModal} />
            </div>

            {/* Modal AI */}
            {aiModalOpen && (
                <div className="ai-modal">
                    <div className="ai-modal-content">
                        {showAiSpinner ? (
                            <img
                                className="ai-analyzer-spinner"
                                src={`${process.env.PUBLIC_URL}/icon/AI/ai-white.gif`}
                                alt="AI Spinner"
                            />
                        ) : (
                            <div className="ai-answer-content">
                                {/* Si el aiAnswer contiene saltos de línea, los reemplazamos por etiquetas <br /> */}
                                <p dangerouslySetInnerHTML={{ __html: formatAiAnswer(aiAnswer) }} />
                            </div>
                        )}
                        <button onClick={closeAiModal} className='form-button'>Cerrar</button>
                    </div>
                </div>
            )}



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
            <p className='mood-value'>{moodLabel}</p>

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
