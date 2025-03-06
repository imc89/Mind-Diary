import { openDB } from 'idb';
//SE IMPORTA PAPAPARSE, UN PARSEADOR DE CSV.
import Papa from 'papaparse';
import './ExportFile.css'


export const exportToCSV = async () => {
    const db = await openDB("diaryDB", 1);
    const storedEntries = await db.getAll("entries");
    const csv = Papa.unparse(storedEntries);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "entries.csv";
    a.click();
    URL.revokeObjectURL(url);
};


