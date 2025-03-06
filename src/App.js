import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// PAGES
import Main from './pages/Main/Main';
import Search from './pages/SearchText/SearchText';
import Images from './pages/SearchImages/SearchImages';
import Graph from './pages/Graph/Graph';

// COMPONENTS
import Navbar from './components/Navbar/Navbar';
import SplashScreen from './components/SplashScreen/SplashScreen';

// TRANSLATIONS
import translations from "./translations/locales.json";


function App() {
    // STATE TO SHOW/HIDE THE SPLASHSCREEN  
    // ESTADO PARA MOSTRAR/OCULTAR EL SPLASHSCREEN  
    const [showSplash, setShowSplash] = useState(true);
    // STATE TO STORE THE SELECTED LANGUAGE  
    // ESTADO PARA ALMACENAR EL IDIOMA SELECCIONADO  
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    // STATE TO STORE THE CURRENT LANGUAGE  
    // ESTADO PARA ALMACENAR EL IDIOMA ACTUAL  
    const [language] = useState(localStorage.getItem("lang") || "es");
    // STATUS TO STORE THE MARK OF WHETHER THE LANGUAGE IS CHANGED
    // ESTADO PARA ALMACENAR LA MARCA DE SI SE CAMBIO EL IDIOMA  
    const [langflag, setLangflag] = useState(localStorage.getItem("langflag"));

    // METHOD TO EXIT THE SPLASHSCREEN  
    // MÉTODO PARA SALIR DEL SPLASHSCREEN  
    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // TRANSLATIONS  
    // TRADUCCIONES  
    useEffect(() => {
        // GET THE STORED LANGUAGE FROM LOCALSTORAGE  
        // OBTENER EL IDIOMA ALMACENADO DESDE LOCALSTORAGE 
        const storedLang = localStorage.getItem("lang");
        if (storedLang) {
            setSelectedLanguage(storedLang);
        }
    }, []);

    const t = (key) => translations[language][key];


    return (
        // ROUTER COMPONENT TO HANDLE PAGE NAVIGATION  
        // COMPONENTE ROUTER PARA MANEJAR LA NAVEGACIÓN ENTRE PÁGINAS  
        <Router basename="/Mind-Diary">
            {showSplash && langflag === null ? (
                <SplashScreen onFinish={handleSplashFinish} />
            ) : (
                <>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Main t={t} language={language} />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/image" element={<Images />} />
                        <Route path="/graph" element={<Graph />} />
                    </Routes>
                </>
            )}
        </Router>
    );
}

export default App;
