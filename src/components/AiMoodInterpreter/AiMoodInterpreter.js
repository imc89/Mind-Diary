import React, { useState, useRef } from 'react';
import './AiMoodInterpreter.css';

// Modelo confirmado como funcional
const MODEL = 'gemini-3-flash-preview';
const STORAGE_KEY = 'gemini_api_key';

const geminiUrl = (apiKey) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;


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
        const API_KEY = localStorage.getItem(STORAGE_KEY);

        if (!API_KEY) {
            setAiAnswer('⚙️ No tienes configurada una API Key. Ve a Configuración para añadirla.');
            setShowAiSpinner(false);
            return;
        }

        const text = promtData;
        const lang = window.localStorage.getItem('lang');

        // Declara la constante promptText. Se tiene en cuenta null en caso de no haber cambiado nunca el idioma.
        const promptText = (lang === 'es' || lang === null)
            ? `Texto: "${text}"\nPregunta: ¿explicame los sentimientos que inspira el texto?`
            : `Text: "${text}"\nQuestion: Can you explain the feelings inspired by this text?`;

        const body = JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
        });
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body
        };

        try {
            const response = await fetch(geminiUrl(API_KEY), options);
            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                setAiAnswer(data.candidates[0].content.parts[0].text);
            } else {
                const errMsg = data?.error?.message || 'Error desconocido';
                console.warn('Gemini error:', errMsg);
                setAiAnswer(`⚠️ Error al obtener respuesta: ${errMsg}`);
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
