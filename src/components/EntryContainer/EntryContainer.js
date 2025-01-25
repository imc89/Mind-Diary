import React from 'react';
// COMPONENTS
import DiaryForm from '../DiaryForm/DiaryForm'
import Preview from '../Preview/Preview';
// STYLES
import './EntryContainer.css';

const EntryContainer = ({ date, onEntrySubmit, entries, deleteEntry }) => {
    return (
        <div className="entry-container">
            <DiaryForm date={date} onEntrySubmit={onEntrySubmit} />
            <Preview date={date} entries={entries} deleteEntry={deleteEntry} />
        </div>
    );
};

export default EntryContainer;
