import React from 'react';
// COMPONENTS
import DiaryForm from '../../components/DiaryForm/DiaryForm'
// STYLES
import './EntryContainer.css';

const EntryContainer = ({ date }) => {

    return (
        <div className="entry-container">
            <DiaryForm date={date} />
            <DiaryForm date={date} />
        </div>
    );
};

export default EntryContainer;
