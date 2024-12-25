import React, { useState, useEffect, useRef } from 'react';
// IMPORT THE "X" ICON OF CLOSING REACT-ICONS
// IMPORTA EL ICONO DE LA "X" DE CERRAR DE REACT-ICONS
import { FaTimes } from 'react-icons/fa';

import './MoodTracker.css';

// DEFINE THE MoodTracker COMPONENT THAT RECEIVES THE onSave AND onClose
// DEFINE EL COMPONENTE MoodTracker QUE RECIBE LAS PROPS onSave Y onClose
const MoodTracker = ({ onSave, onClose }) => {
    // STATE FOR THE VALUE OF THE SLIDER, BY DEFAULT IN 50 (NORMAL)
    // ESTADO PARA EL VALOR DEL SLIDER, POR DEFECTO EN 50 (NORMAL)
    const [sliderValue, setSliderValue] = useState('50');
    // STATE FOR MOOD LABEL, BY DEFAULT IN 'NORMAL'
    // ESTADO PARA LA ETIQUETA DEL ESTADO DE ANIMO, POR DEFECTO 'NORMAL'
    const [label, setLabel] = useState('NORMAL');
    // REFERENCE TO A DIV ELEMENT IN DOM
    // REFERENCIA A UN ELEMENTO DIV EN EL DOM
    const divRef = useRef(null);

    // COLOR ARRAY FOR ANIMATION
    // ARRAY DE COLORES PARA LA ANIMACION
    const colors = ['#8A2BE2', '#1E90FF', '#4682B4', '#00BFFF', '#32CD32', '#FFD700', '#FF8C00'];
    // ARRAY OF TAGS FOR MOOD
    // ARRAY DE ETIQUETAS PARA EL ESTADO DE ANIMO
    const labels = ["MUY MAL", "MAL", "ALGO MAL", "NORMAL", "ALGO BIEN", "BIEN", "MUY BIEN"];

    // APPLY THE COLOR CHANGE TO THE ANIMATION WHEN ASSEMBLING THE COMPONENT TO ENSURE THAT ANIMATION IS SHOWN
    // APLICA EL CAMBIO DE COLOR A LA ANIMACION AL MONTAR EL COMPONENTE PARA ASEGURAR QUE SE MUESTRE LA ANIMACION
    useEffect(() => {
        if (divRef.current) {
            colorChangeAnimation(sliderValue);
        }
        // eslint-disable-next-line
    }, []);

    // FUNCTION TO UPDATE THE ANIMATION COLOR WHEN CHANGING THE SLIDER
    // FUNCION PARA ACTUALIZAR EL COLOR DE ANIMACION AL CAMBIAR EL SLIDER
    const colorChangeAnimation = (value) => {
        // OBTAINED THE DIV REFERENCE
        // OBTIENE LA REFERENCIA DEL DIV
        const div = divRef.current;
        // IF THERE IS NO DIV, DOES NOTHING
        // SI NO HAY DIV, NO HACE NADA
        if (!div) return;

        // ADD A GENTLE TRANSITION TO COLOR CHANGE
        // AÑADE UNA TRANSICION SUAVE AL CAMBIO DE COLOR
        div.style.transition = 'box-shadow 0.1s ease';
        // CONVERT THE VALUE OF THE SLIDER TO NUMBER
        // CONVIERTE EL VALOR DEL SLIDER A NUMERO
        value = Number(value)

        // ASSIGN COLORS ACCORDING TO THE VALUE OF THE SLIDER
        // ASIGNAR LOS COLORES SEGUN EL VALOR DEL SLIDER
        if (value === 0) {
            div.style.setProperty('--colorStart', colors[0]);
            div.style.setProperty('--colorEnd', colors[0]);
        } else if (value > 0 && value < 16.66) {
            div.style.setProperty('--colorStart', colors[0]);
            div.style.setProperty('--colorEnd', colors[1]);
        } else if (value === 16.66) {
            div.style.setProperty('--colorStart', colors[1]);
            div.style.setProperty('--colorEnd', colors[1]);
        } else if (value > 16.66 && value < 33.33) {
            div.style.setProperty('--colorStart', colors[1]);
            div.style.setProperty('--colorEnd', colors[2]);
        } else if (value === 33.33) {
            div.style.setProperty('--colorStart', colors[2]);
            div.style.setProperty('--colorEnd', colors[2]);
        } else if (value > 33.33 && value < 50) {
            div.style.setProperty('--colorStart', colors[2]);
            div.style.setProperty('--colorEnd', colors[3]);
        } else if (value === 50) {
            div.style.setProperty('--colorStart', colors[3]);
            div.style.setProperty('--colorEnd', colors[3]);
        } else if (value > 50 && value < 66.66) {
            div.style.setProperty('--colorStart', colors[3]);
            div.style.setProperty('--colorEnd', colors[4]);
        } else if (value === 66.66) {
            div.style.setProperty('--colorStart', colors[4]);
            div.style.setProperty('--colorEnd', colors[4]);
        } else if (value > 66.66 && value < 83.33) {
            div.style.setProperty('--colorStart', colors[4]);
            div.style.setProperty('--colorEnd', colors[5]);
        } else if (value === 83.33) {
            div.style.setProperty('--colorStart', colors[5]);
            div.style.setProperty('--colorEnd', colors[5]);
        } else if (value > 83.33 && value < 100) {
            div.style.setProperty('--colorStart', colors[5]);
            div.style.setProperty('--colorEnd', colors[6]);
        } else if (value === 100) {
            div.style.transition = 'box-shadow 0.1s ease';
            div.style.setProperty('--colorStart', colors[6]);
            div.style.setProperty('--colorEnd', colors[6]);
        }
    };

    // HANDLES THE CHANGE OF VALUE OF THE SLIDER
    // MANEJA EL CAMBIO DE VALOR DEL SLIDER
    const handleSliderChange = (event) => {
        // GET THE VALUE OF THE SLIDER
        // OBTIENE EL VALOR DEL SLIDER
        const value = event.target.value;
        // UPDATE THE STATUS OF THE VALUE OF THE SLIDER
        // ACTUALIZA EL ESTADO DEL VALOR DEL SLIDER
        setSliderValue(value);
        // UPDATE COLOR CHANGE
        // ACTUALIZA EL CAMBIO DE COLOR
        colorChangeAnimation(value);
        // CALCULATE THE LABEL INDEX BASED ON THE VALUE OF THE SLIDER TAKING INTO ACCOUNT THE DIFFERENCE BETWEEN SECTIONS
        // CALCULA EL INDICE DE LA ETIQUETA BASADO EN EL VALOR DEL SLIDER TENIENDO EN CUENTA LA DIFERENCIA ENTRE TRAMOS
        const index = Math.floor(value / 16.67);
        // UPDATE THE MOOD LABEL
        // ACTUALIZA LA ETIQUETA DEL ESTADO DE ÁNIMO
        setLabel(labels[index]);
    };

    // KEEP THE MOOD SELECTED
    // GUARDA EL ESTADO DE ANIMO SELECCIONADO
    const handleSave = () => {
        // CALCULATE THE COLOR INDEX BASED ON THE VALUE OF THE SLIDER TAKING INTO ACCOUNT THE DIFFERENCE BETWEEN SECTIONS
        // CALCULA EL INDICE DEL COLOR BASADO EN EL VALOR DEL SLIDER TENIENDO EN CUENTA LA DIFERENCIA ENTRE TRAMOS
        const index = Math.floor(sliderValue / 16.67);
        // OBTAIN THE CORRESPONDING COLOR
        // OBTIENE EL COLOR CORRESPONDIENTE
        const color = colors[index];
        // CALL THE onSave FUNCTION WITH THE LABEL AND COLOR
        // LLAMA A LA FUNCION ONSAVE CON LA ETIQUETA Y EL COLOR
        onSave({ label, color });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}><FaTimes /></button>
                {/*  DIV OF ANIMATION WITH REFERENCE /  DIV DE LA ANIMACION CON REFERENCIA*/}
                <div className="animated-div" ref={divRef}></div>
                <div className="value-labels">
                    <span>{label}</span>
                </div>
                <div className='mood-controls'>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={handleSliderChange}
                    />
                </div>

                <button className="accept-mood" onClick={handleSave}>Aceptar</button>
            </div>
        </div>
    );
};

export default MoodTracker;
