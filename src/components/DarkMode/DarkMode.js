import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import './DarkMode.css';

const DarkMode = ({ onToggle }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effect to apply dark mode based on local storage or default
    useEffect(() => {
        const storedMode = sessionStorage.getItem('darkMode');
        if (storedMode) {
            setIsDarkMode(storedMode === 'true');
        }
    }, []);

    // Toggle dark mode
    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const newMode = !prev;
            sessionStorage.setItem('darkMode', newMode);
            return newMode;
        });
    };

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    return (
        <label className="toggle-switch">
            <input 
                type="checkbox" 
                onClick={onToggle} 
                checked={isDarkMode} 
                onChange={toggleDarkMode} 
            />
            <span className="slider">
                <FaSun className="icon sun" />
                <FaMoon className="icon moon" />
            </span>
        </label>
    );
};

export default DarkMode;
