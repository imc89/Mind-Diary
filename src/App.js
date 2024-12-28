import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// PAGES
import Main from './pages/Main/Main';
import Search from './pages/SearchText/SearchText';
import Images from './pages/SearchImages/SearchImages';
import Graph from './pages/Graph/Graph';
// COMPONENTS
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen/SplashScreen';

function App() {
    // STATE TO SHOW/HIDE THE SPLASHSCREEN
    // ESTADO PARA MOSTRAR/OCULTAR EL SPLASHSCREEN
    const [showSplash, setShowSplash] = useState(true);

    // METHOD TO GET OUT OF SPLASHSCREEN
    // METODO PARA SALIR DEL SPLASHSCREEN
    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    return (
        <Router basename="/Mind-Diary">
            {showSplash ? (
                <SplashScreen onFinish={handleSplashFinish} />
            ) : (
                <>
                    <Navbar />
                    <Routes>
                        <Route path="/" element={<Main />} />
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