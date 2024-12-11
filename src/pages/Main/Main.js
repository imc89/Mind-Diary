import React, { useState } from 'react';
import Calendar from 'react-calendar';
// UTILS
import Focus from '../../utils/Focus';
// COMPONENTS
import DiaryForm from '../../components/DiaryForm/DiaryForm'
// STYLES
import './Main.css';

const Main = () => {
    // FOCUS BEHAVIOR OF CALENDAR BUTTONS FOR MOBILE DEVICES.
    // COMPORTAMIENTO FOCUS DE LOS BOTONES DEL CALENDARIO PARA DISPOSITIVOS MOVILES.
    Focus();
    const [date, setDate] = useState(new Date());

    const onDateChange = (newDate) => {
        setDate(newDate);
    };


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
            <DiaryForm  date={date}/>
        </div>
    );
};

export default Main;
