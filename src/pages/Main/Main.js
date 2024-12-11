import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import './Main.css';

const Main = () => {
    const [date, setDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setDate(newDate);
    };

   
        useEffect(() => {
          // Asegúrate de que el código se ejecute después de que los elementos estén en el DOM
          const tiles = document.querySelectorAll('.react-calendar__tile');
          tiles.forEach((tile) => {
            tile.setAttribute('tabindex', '0');
          });
        }, []); // Ejecutar solo una vez al montar el componente
      
      
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
