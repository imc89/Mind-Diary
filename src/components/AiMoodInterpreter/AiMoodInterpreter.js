import React, { useState, useRef } from 'react';
import './AiMoodInterpreter.css';

// Modelos en orden de prioridad (si el primero da 429, se prueba el siguiente)
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

const geminiUrl = (model) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

// Retry con backoff exponencial: espera 1s, 2s, 4s entre intentos
const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch(url, options);
        if (response.status !== 429) return response;
        if (attempt < retries - 1) {
            const waitTime = delay; // capturamos el valor actual antes del closure
            console.warn(`429 recibido. Reintentando en ${waitTime}ms... (intento ${attempt + 1}/${retries})`);
            await new Promise(res => setTimeout(res, waitTime));
            delay *= 2; // backoff exponencial
        }
    }
    // Último intento sin capturar el 429
    return fetch(url, options);
};

const AiMoodInterpreter = ({ promtData, t, language }) => {

    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiIconSrc, setAiIconSrc] = useState(`${process.env.PUBLIC_URL}/icon/AI/ai-white.png`);
    const [showAiSpinner, setShowAiSpinner] = useState(true);
    const [aiAnswer, setAiAnswer] = useState('');

    // Ref para el debounce — evita llamadas en ráfaga que provocan 429
    const debounceRef = useRef(null);


    // Función para abrir la modal AI
    const openAiModal = () => {
        setAiAnswer('');
        setShowAiSpinner(true);
        setAiModalOpen(true);

        // Debounce: si el usuario abre/cierra rápido, cancelamos la llamada anterior
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            askGemini();
        }, 300);
    };


    const askGemini = async () => {
        const text = promtData;
        const lang = window.localStorage.getItem('lang');

        // Declara la constante promptText. Se tiene en cuenta null en caso de no haber cambiado nunca el idioma.
        const promptText = (lang === 'es' || lang === null)
            ? `Texto: "${text}"\nPregunta: ¿explicame los sentimientos que inspira el texto?`
            : `Text: "${text}"\nQuestion: Can you explain the feelings inspired by this text?`;

        const body = JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
        });
        const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

        try {
            let geminiResponse = null;

            // Intentar con cada modelo hasta obtener respuesta válida
            for (const model of MODELS) {
                const response = await fetchWithRetry(geminiUrl(model), options);

                if (response.ok) {
                    const data = await response.json();
                    geminiResponse = data.candidates[0].content.parts[0].text;
                    break; // éxito, salimos del bucle
                }

                const errorData = await response.json();
                console.warn(`Modelo ${model} falló (${response.status}):`, errorData?.error?.message);
                // Si no es 429 o 503, no tiene sentido probar el siguiente modelo
                if (response.status !== 429 && response.status !== 503) break;
            }

            if (geminiResponse) {
                setAiAnswer(geminiResponse);
            } else {
                setAiAnswer('⚠️ No se pudo obtener respuesta de la IA. Inténtalo de nuevo más tarde.');
            }

        } catch (error) {
            console.error('Error al llamar a Gemini:', error.message);
            setAiAnswer('⚠️ Error de conexión. Comprueba tu red e inténtalo de nuevo.');
        } finally {
            // Ocultar spinner solo cuando llega la respuesta real
            setShowAiSpinner(false);
        }
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
        text = text.replace(/\*\*([^**]+)\*\*/g, (match, p1) => `<b>${p1}</b>`);

        return text;
    }

    // Función para cerrar la modal AI
    const closeAiModal = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setAiModalOpen(false);
    };


    return (
        <div>
            <div
                className='ai-analyzer'
                onMouseOver={() => setAiIconSrc(`${process.env.PUBLIC_URL}/icon/AI/ai-white.gif`)}
                onMouseOut={() => setAiIconSrc(`${process.env.PUBLIC_URL}/icon/AI/ai-white.png`)}
            >
                <p className='ai-analyzer-text'> {t('diary-form-ai-analyser')} &#8594; </p>
                <img className='ai-analyzer-img' src={aiIconSrc} alt="AI Analyzer" onClick={openAiModal} />
            </div>
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
        </div>
    );
};

export default AiMoodInterpreter;
