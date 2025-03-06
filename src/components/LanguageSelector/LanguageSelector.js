import React, { useState } from 'react';
import { GrLanguage } from "react-icons/gr";
import './LanguageSelector.css';

const LanguageSelector = () => {
    // DECLARES A STATE VARIABLE 'open' TO CONTROL THE DROPDOWN MENU VISIBILITY
    // DECLARA UNA VARIABLE DE ESTADO 'open' PARA CONTROLAR LA VISIBILIDAD DEL MENÚ DESPLEGABLE
    const [open, setOpen] = useState(false);

    // THIS FUNCTION TOGGLES THE DROPDOWN MENU STATE (OPEN OR CLOSED)
    // ESTA FUNCIÓN CAMBIA EL ESTADO DEL MENÚ DESPLEGABLE (ABIERTO O CERRADO)
    const toggleDropdown = () => {
        setOpen(!open);
    };

    // THIS FUNCTION STORES THE SELECTED LANGUAGE IN LOCAL STORAGE AND RELOADS THE PAGE
    // ESTA FUNCIÓN GUARDA EL IDIOMA SELECCIONADO EN EL ALMACENAMIENTO LOCAL Y RECARGA LA PÁGINA
    const selectLanguage = (language) => {
        // SAVES THE LANGUAGE CODE 
        // GUARDA EL CÓDIGO DEL IDIOMA
        window.localStorage.setItem("lang", language);
        // DEACTIVATES THE langflag IMMEDIATELY 
        // DESACTIVA langflag INMEDIATAMENTE
        window.localStorage.setItem("langflag", true);
        // RELOADS THE PAGE TO APPLY THE LANGUAGE CHANGE 
        // RECARGA LA PÁGINA PARA APLICAR EL CAMBIO DE IDIOMA
        window.location.reload();
    };


    return (
        <div className="lang-container">
            <label
                className={`lang-switch ${open ? 'open' : ''}`}
                onClick={toggleDropdown}
            >
                <span className="lang-icon"><GrLanguage /></span>
            </label>

            {open && (
                <ul className="lang-dropdown">
                    <li onClick={() => selectLanguage('en')} className='lang-option'>
                        <img src={`${process.env.PUBLIC_URL}/icon/language/en.png`} alt="lang" className="lang-flag-icon" />
                    </li>
                    <li onClick={() => selectLanguage('es')} className='lang-option'>
                        <img src={`${process.env.PUBLIC_URL}/icon/language/es.png`} alt="lang" className="lang-flag-icon" />

                    </li>
                </ul>
            )}
        </div>
    );
};

export default LanguageSelector;
