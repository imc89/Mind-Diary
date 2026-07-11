import React from 'react';
// COMPONENTS
import DiaryForm from '../DiaryForm/DiaryForm'
import Preview from '../Preview/Preview';
// STYLES
import './EntryContainer.css';

const EntryContainer = ({ date, onEntrySubmit, entries, deleteEntry, t, language }) => {
    return (
        <div className="entry-container">
            <DiaryForm date={date} onEntrySubmit={onEntrySubmit} t={t} language={language}/>
            <Preview date={date} entries={entries} deleteEntry={deleteEntry}  t={t} language={language} />
        </div>
    );
};

export default EntryContainer;
