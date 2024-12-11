import React, { useState } from 'react';
import Calendar from 'react-calendar';
import './Main.css';

const Main = () => {
    const [date, setDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setDate(newDate);
    };

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
