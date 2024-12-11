import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav>
            <ul>
                <li><Link to="/">Principal</Link></li>
                <li><Link to="/search">Búsqueda</Link></li>
                <li><Link to="/image">Imágenes</Link></li>
                <li><Link to="/graph">Gráficos</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
