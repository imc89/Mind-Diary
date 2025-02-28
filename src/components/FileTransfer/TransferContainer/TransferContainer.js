import React from 'react';
import ExportFile from '../ExportFile/ExportFile';
import ImportFile from '../ImportFile/ImportFile';
//SE IMPORTA PAPAPARSE, UN PARSEADOR DE CSV.
import './TransferContainer.css'

const TransferContainer = () => {

    return (
        <div className="export-import-buttons">
            <ExportFile />
            <ImportFile />
        </div>
    );
};

export default TransferContainer;