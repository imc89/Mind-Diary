import React, { useEffect } from 'react';
import { FaFileUpload } from 'react-icons/fa';
import './DiaryForm.css';

const DiaryForm = ({ date, saveEntry, entries }) => {

    useEffect(() => {
        if ('indexedDB' in window) {
            // Abrimos la DB
            var diaryDB = window.indexedDB.open('diaryDB', 1);

            diaryDB.onerror = function (event) {
                // Manejamos el error al abrir.
                console.error('error:', event.target.errorCode);
            };

            diaryDB.onsuccess = function (event) {
                // Hacemos el proceso exitoso al abrir.
                diaryDB = event.target.result;
            };
        } else {
            alert("¡IndexedDB no es compatible!");
        }
    });



    return (
        <div className="diary-form">
            <div className="header">
                <h2>Entrada para: {new Date(date).toLocaleDateString()}</h2>
            </div>
            <textarea
                placeholder="Escribe tu entrada aquí..."
            ></textarea>
            <div className="file-upload">
                <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                    id="image-upload"
                />
                <label htmlFor="image-upload" className="file-label">
                    <FaFileUpload className="upload-icon" /> Subir Imagen
                </label>
            </div>
            <button>
                Guardar Entrada
            </button>

        </div>
    );
};

export default DiaryForm;
