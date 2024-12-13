import React, { useState, useEffect, useCallback } from 'react';

// COMPONENTS
// COMPONENTES
import Calendar from 'react-calendar';
import EntryContainer from '../../components/EntryContainer/EntryContainer';
// VARIABLES
import { userLocale } from '../../utils/utilsValues';

// STYLES
// ESTILOS
import './Main.css';

const Main = () => {
    // STATE FOR THE SELECTED DATE IN THE CALENDAR
    // ESTADO PARA LA FECHA SELECCIONADA EN EL CALENDARIO
    const [date, setDate] = useState(new Date());
    // STATE FOR STORING DIARY ENTRIES
    // ESTADO PARA ALMACENAR LAS ENTRADAS DEL DIARIO
    const [entries, setEntries] = useState({});
    // FUNCTION TO OPEN THE DATABASE
    // FUNCIÓN PARA ABRIR LA BASE DE DATOS
    const openDatabase = () => {
        return new Promise((resolve, reject) => {
            // OPEN A CONNECTION TO THE INDEXEDDB 'DIARYDB'
            // ABRE UNA CONEXION CON LA BASE DE DATOS INDEXEDDB 'DIARYDB'
            const request = indexedDB.open('diaryDB', 1);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // WHEN UPGRADING THE DB, CREATE THE 'ENTRIES' OBJECT STORE IF IT DOESN'T EXIST
                // AL ACTUALIZAR LA BASE DE DATOS, CREA EL ALMACEN DE OBJETOS 'ENTRIES' SI NO EXISTE
                if (!db.objectStoreNames.contains('entries')) {
                    db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
                    // CREATES THE 'ENTRIES' STORE WITH 'ID' AS THE PRIMARY KEY
                    // CREA EL ALMACEN 'ENTRIES' CON 'ID' COMO CLAVE PRIMARIA
                }
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
                // IF THE REQUEST IS SUCCESSFUL, RESOLVE THE PROMISE WITH THE RESULT
                // SI LA SOLICITUD ES EXITOSA, RESUELVE LA PROMESA CON EL RESULTADO

            };

            request.onerror = (event) => {
                reject(event.target.error);
                // IF AN ERROR OCCURS, REJECT THE PROMISE WITH THE ERROR
                // SI OCURRE UN ERROR, RECHAZA LA PROMESA CON EL ERROR
            };
        });
    };

    // FUNCTION TO FETCH ALL ENTRIES FROM THE DATABASE
    // FUNCION PARA OBTENER TODAS LAS ENTRADAS DE LA BASE DE DATOS
    const fetchAllEntries = (db) => {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('entries', 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();
            // START A TRANSACTION TO READ FROM THE 'ENTRIES' STORE
            // INICIA UNA TRANSACCION PARA LEER DEL ALMACEN 'ENTRIES'
            request.onsuccess = (event) => {
                resolve(event.target.result);
                db.close()
                // IF THE REQUEST IS SUCCESSFUL, RESOLVE THE PROMISE WITH THE RESULT
                // SI LA SOLICITUD ES EXITOSA, RESUELVE LA PROMESA CON EL RESULTADO
            };

            request.onerror = (event) => {
                reject(event.target.error);
                db.close()
                // IF AN ERROR OCCURS, REJECT THE PROMISE WITH THE ERROR
                // SI OCURRE UN ERROR, RECHAZA LA PROMESA CON EL ERROR
            };

        });
    };

    // FUNCTION TO UPDATE THE ENTRIES BY DAY AFTER A NEW ENTRY IS SUBMITTED
    // FUNCION PARA MAPEAR LAS ENTRADAS QUE TIENEN ENTRADAS Y ASOCIARLAS CON HAS-ENTRY
    const onEntrySubmit = useCallback(async () => {
        const db = await openDatabase();
        const allEntries = await fetchAllEntries(db);

        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const daysInMonth = [];
        // LOOP THROUGH THE DAYS OF THE MONTH TO GENERATE THE LIST OF DATES
        // BUCLE A TRAVES DE LOS DIAS DEL MES PARA GENERAR LA LISTA DE FECHAS
        for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
            const entryDateString = new Date(d).toLocaleDateString(userLocale);
            daysInMonth.push(entryDateString);
            // PUSH EACH DATE OF THE MONTH AS A STRING IN THE CORRECT LOCALE FORMAT
            // AGREGA CADA FECHA DEL MES COMO UNA CADENA EN EL FORMATO ADECUADO DEL LOCALE
        }

        const entriesByDay = daysInMonth.reduce((iterator, day) => {
            // .SOME() HAS THE FUNCTION TO SEE IF ANY ELEMENT OF THE INDEXEDDB ENTRIES COMPLIES THAT THE ITERATED DATE EXISTS BASED ON
            // .SOME() SIRVE PARA VER SI ALGUN ELEMENTO DE LAS ENTRADAS DE INDEXEDDB CUMPLE QUE LA FECHA DE ITERADA EXISTA EN BASE
            iterator[day] = allEntries.some(entry => entry.date === day) ? 'has-entry' : '';
            // FOR EACH DAY, CHECK IF THERE IS AN ENTRY AND MARK IT WITH 'has-entry' IF IT EXISTS
            // PARA CADA DIA, VERIFICA SI HAY UNA ENTRADA Y MARCA CON 'has-entry' SI EXISTE
            return iterator;
        }, {});
        // SET THE ENTRIES IN THE STATE WITH THE entriesByDay OBJECT
        // ESTABLECE LAS ENTRADAS EN EL ESTADO CON EL OBJETO entriesByDay
        setEntries(entriesByDay);
        // 'ONENTRYSUBMIT' ONLY CHANGES WHEN 'DATE' CHANGES
        // ONENTRYSUBMIT SOLO CAMBIA CUANDO 'DATE' CAMBIA
    }, [date]);

    // FUNCTION TO CHANGE THE SELECTED DATE IN THE CALENDAR
    // CAMBIAR LA FECHA SELECCIONADA EN EL CALENDARIO
    const onDateChange = (newDate) => {
        setDate(newDate);
        // UPDATE THE STATE WITH THE NEW SELECTED DATE
        // ACTUALIZA EL ESTADO CON LA NUEVA FECHA SELECCIONADA
    };

    // FUNCTION TO DISABLE DAYS WITHOUT ENTRIES (IF NEEDED)
    // PARA DESHABILITAR DÍAS SIN ENTRADAS (SI ES NECESARIO)
    const tileDisabled = ({ date }) => {
        return date > new Date();
        // DISABLE FUTURE DATES IN THE CALENDAR
        // DESHABILITA LAS FECHAS FUTURAS EN EL CALENDARIO
    };

    useEffect(() => {
        // CALL onEntrySubmit WHEN THE COMPONENT MOUNTS 
        // LLAMA A onEntrySubmit CUANDO EL COMPONENTE SE MONTA 
        onEntrySubmit();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <div className="header">
                <h1>Mind Diary</h1>
            </div>
            <Calendar
                onChange={onDateChange}
                value={date}
                showNeighboringMonth={false}
                tileClassName={({ date }) => {
                    const dateString = date.toLocaleDateString(userLocale);
                    return entries[dateString] || '';
                    // aqui entries es un array de objetos cada objeto es una fecha del mes con el valor si tiene has-entry o no
                }}
                tileDisabled={tileDisabled}
            />
            <EntryContainer date={date} onEntrySubmit={onEntrySubmit} />
        </div>
    );
};

export default Main;