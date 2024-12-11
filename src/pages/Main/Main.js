import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Main.css';

const Main = () => {
    const [date, setDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setDate(newDate);
    };

    useEffect(() => {
        // Selecciona todos los elementos con la clase .react-calendar__tile
        const tiles = document.querySelectorAll('.react-calendar__tile');

        // Itera sobre cada tile y agrega el manejador de clic
        tiles.forEach((tile) => {
          tile.addEventListener('click', () => {
            tile.focus(); // Esto asegura que el tile obtenga el foco cuando se hace clic
          });
        });
      }, []);
      
    return (
        <div>
            <div className="header">
                <h1>Mi Diario Interactivo</h1>
            </div>
            <Calendar
                onChange={onDateChange}
                value={date}
                showNeighboringMonth={false}
            />
        </div>
    );
};

export default Main;
