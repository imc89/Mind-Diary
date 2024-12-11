import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Pages
import Main from './pages/Main/Main';
import Search from './pages/SearchText/SearchText';
import Images from './pages/SearchImages/SearchImages';
import Graph from './pages/Graph/Graph';
// Components
import Navbar from './components/Navbar';

function App() {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    <Route exact path="/" element={<Main/>} />
                    <Route path="/search" element={<Search/>} />
                    <Route path="/image" element={<Images/>} />
                    <Route path="/graph" element={<Graph/>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
