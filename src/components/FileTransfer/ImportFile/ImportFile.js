import React, { useState } from 'react';
import { openDB } from 'idb';
import { BiImport } from "react-icons/bi";
//SE IMPORTA PAPAPARSE, UN PARSEADOR DE CSV.
import Papa from 'papaparse';
import useRefresh from '../../Refresh/Refresh';

import './ImportFile.css'

const ImportFile = () => {
    const refreshPage = useRefresh();

    const importFromCSV = async (event) => {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                complete: async (result) => {
                    const db = await openDB("diaryDB", 1);
                    result.data.forEach(async (entry) => {
                        if (entry.date && entry.entry) {
                            await db.add("entries", entry);
                        }
                    });
                    alert("Importación completada");
                    refreshPage();
                },
                header: true,  // Si el CSV tiene encabezado
            });
        }
    };

    return (
        <div>
            <button className="export-import-buttons">
                <label className="icon-button" title="Importar entradas">
                    <FaUpload />
                    <input
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={importFromCSV} />
                </label>
            </button>
        </div>
    );
};

export default ImportFile;