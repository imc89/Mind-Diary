import React from 'react';
// COMPONENTS
import DiaryForm from '../../components/DiaryForm/DiaryForm'
// STYLES
import './EntryContainer.css';

const EntryContainer = ({ date, onEntrySubmit }) => {
    return (
        <div className="entry-container">
            <DiaryForm date={date} onEntrySubmit={onEntrySubmit} />
            <DiaryForm date={date} />
        </div>
    );
};

export default EntryContainer;
