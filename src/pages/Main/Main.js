import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Main.css';

const Main = () => {
    const [date, setDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setDate(newDate);
    };

    // We add the effect of the focus since on mobile devices it is not functional from css
    // Añadimos el efecto del focus ya que en dispositivos moviles no es funcional desde css
    useEffect(() => {
        // Select all the elements with the class .react-calendar__tile
        // Selecciona todos los elementos con la clase .react-calendar__tile
        const tiles = document.querySelectorAll('.react-calendar__tile');

        // runs through each tile and add the click handler
        // Itera sobre cada tile y agrega el manejador de click
        tiles.forEach((tile) => {
            tile.addEventListener('click', () => {
                tile.focus(); // add focus on each tile
            });
        });
    }, []);

    return (
        <div>
            <div className="header">
                <h1>Mind Diary</h1>
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
