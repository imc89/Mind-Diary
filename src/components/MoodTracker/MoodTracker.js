import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import './MoodTracker.css';

const MoodTracker = ({ onSave, onClose }) => {
    const [sliderValue, setSliderValue] = useState('50');  // Default to 50 for 'NORMAL'
    const [label, setLabel] = useState('NORMAL');
    const divRef = useRef(null);

    const colors = ['#8A2BE2', '#1E90FF', '#4682B4', '#00BFFF', '#32CD32', '#FFD700', '#FF8C00'];
    const labels = ["MUY MAL", "MAL", "ALGO MAL", "NORMAL", "ALGO BIEN", "BIEN", "MUY BIEN"];

    // Apply box shadow effect when component mounts to ensure the animation is shown
    useEffect(() => {
        if (divRef.current) {
            updateBoxShadow(sliderValue);
        }
    }, []);

    // Function to update the box-shadow based on the slider value
    const updateBoxShadow = (value) => {
        const div = divRef.current;
        if (!div) return;

        div.style.transition = 'box-shadow 0.1s ease';
        value = Number(value)
        if (value === 0) {
            div.style.setProperty('--colorStart', colors[0]);
            div.style.setProperty('--colorEnd', colors[0]);
        } else if (value > 0 && value < 16) {
            div.style.setProperty('--colorStart', colors[0]);
            div.style.setProperty('--colorEnd', colors[1]);
        } else if (value === 16) {
            div.style.setProperty('--colorStart', colors[1]);
            div.style.setProperty('--colorEnd', colors[1]);
        } else if (value > 16 && value < 33) {
            div.style.setProperty('--colorStart', colors[1]);
            div.style.setProperty('--colorEnd', colors[2]);
        } else if (value === 33) {
            div.style.setProperty('--colorStart', colors[2]);
            div.style.setProperty('--colorEnd', colors[2]);
        } else if (value > 33 && value < 50) {
            div.style.setProperty('--colorStart', colors[2]);
            div.style.setProperty('--colorEnd', colors[3]);
        } else if (value === 50) {
            div.style.setProperty('--colorStart', colors[3]);
            div.style.setProperty('--colorEnd', colors[3]);
        } else if (value > 50 && value < 68) {
            div.style.setProperty('--colorStart', colors[3]);
            div.style.setProperty('--colorEnd', colors[4]);
        } else if (value === 68) {
            div.style.setProperty('--colorStart', colors[4]);
            div.style.setProperty('--colorEnd', colors[4]);
        } else if (value > 68 && value < 85) {
            div.style.setProperty('--colorStart', colors[4]);
            div.style.setProperty('--colorEnd', colors[5]);
        } else if (value === 85) {
            div.style.setProperty('--colorStart', colors[5]);
            div.style.setProperty('--colorEnd', colors[5]);
        } else if (value > 85 && value < 100) {
            div.style.setProperty('--colorStart', colors[5]);
            div.style.setProperty('--colorEnd', colors[6]);
        } else if (value === 100) {
            div.style.transition = 'box-shadow 0.1s ease';
            div.style.setProperty('--colorStart', colors[6]);
            div.style.setProperty('--colorEnd', colors[6]);
        }
    };

    // Handle slider value change
    const handleSliderChange = (event) => {
        const value = event.target.value;
        setSliderValue(value);
        updateBoxShadow(value);
        const index = Math.floor(value / 16.66);
        setLabel(labels[index]);
    };

    // Save the selected mood
    const handleSave = () => {
        const index = Math.floor(sliderValue / 16.66);
        const color = colors[index];
        onSave({ label, color });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
            <button className="close-button" onClick={onClose}><FaTimes /></button>
            <div className="animated-div" ref={divRef}></div>
                <div className="value-labels">
                    <span>{label}</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                />
                <div className="markers"></div>
                <button className="accept-mood" onClick={handleSave}>Aceptar</button>
            </div>
        </div>
    );
};

export default MoodTracker;
