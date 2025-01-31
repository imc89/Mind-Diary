import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaExchangeAlt } from "react-icons/fa";

import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Función para cerrar el menú cuando se haga clic en una opción
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className='home-container' onClick={closeMenu}>
                    <img src={`${process.env.PUBLIC_URL}/icon.png`} alt="Logo" className="navbar-logoimg" />
                    <h1 className="navbar-logo">
                        Mind Diary
                    </h1>
                </Link>
                <div className='mobile-menu'>
                    <button className="navbar-toggle" onClick={toggleMenu}>
                        <span className="navbar-icon"></span>
                        <span className="navbar-icon"></span>
                        <span className="navbar-icon"></span>
                    </button>
                    <button className="navbar-toggle">
                    <span><FaExchangeAlt/></span>
                    </button>
                </div>
                <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`} >
                    <li className="navbar-item"><Link to="/search" onClick={closeMenu}>Búsqueda</Link></li>
                    <li className="navbar-item"><Link to="/image" onClick={closeMenu}>Imágenes</Link></li>
                    <li className="navbar-item"><Link to="/graph" onClick={closeMenu}>Gráficos</Link></li>
                    <li className='navbar-item desktop-only'><FaExchangeAlt/></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
