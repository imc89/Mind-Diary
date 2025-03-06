import React, { useState, useEffect, useCallback } from 'react';

// COMPONENTS
// COMPONENTES
import Calendar from 'react-calendar';
import EntryContainer from '../../components/EntryContainer/EntryContainer';
import DarkMode from '../../components/DarkMode/DarkMode';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';

// VARIABLES
// ESTILOS
import { userLocale } from '../../utils/utilsValues';

// STYLES
// ESTILOS
import './Main.css';
import './Main-Dark.css';

// ACCEPTS t AND language AS PROPS
// ACEPTA t Y language COMO PROPIEDADES
const Main = ({ t, language }) => {

    useEffect(() => {
        // REMOVE THE LANGUAGE FLAG FROM LOCAL STORAGE ON COMPONENT MOUNT
        // ELIMINA LA MARCA DE IDIOMA DEL LOCALSTORAGE AL MONTAR EL COMPONENTE
        window.localStorage.removeItem("langflag");
    }, []);

    // STATE FOR THE SELECTED DATE IN THE CALENDAR
    // ESTADO PARA LA FECHA SELECCIONADA EN EL CALENDARIO
    const [date, setDate] = useState(new Date());
    // STATE FOR STORING DIARY ENTRIES
    // ESTADO PARA ALMACENAR LAS ENTRADAS DEL DIARIO
    const [entries, setEntries] = useState({});
    // STATE FOR THE ACTIVE START DATE IN THE CALENDAR
    // ESTADO PARA LA FECHA DE INICIO ACTIVA EN EL CALENDARIO
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    // DARK MODE
    // MODO OSCURO
    const [isDarkMode, setIsDarkMode] = useState(false); // Estado para el modo oscuro

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

        const startOfMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1);
        const endOfMonth = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 0);

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
    }, [activeStartDate]);

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

    // FUNCTION TO DETECT MONTH/YEAR NAVIGATION CHANGES
    // FUNCIÓN PARA DETECTAR LOS CAMBIOS DE NAVEGACION DE MES/AÑO
    const handleActiveStartDateChange = ({ activeStartDate }) => {
        setActiveStartDate(activeStartDate);
        // UPDATE THE STATE WHEN THE MONTH OR YEAR IS CHANGED
        // ACTUALIZA EL ESTADO CUANDO SE CAMBIA EL MES O AÑO
    };

    // FUNCTION TO TOGGLE DARK MODE
    // FUNCIÓN PARA ACTIVAR/DESACTIVAR EL MODO OSCURO
    const handleToggle = () => {
        // CAMBIA EL ESTADO AL VALOR OPUESTO
        // CHANGE THE STATE TO THE OPPOSITE VALUE
        setIsDarkMode(prevState => !prevState);
    };

    // SAVE DARK MODE STATE IN SESSION STORAGE
    // GUARDA EL ESTADO DEL MODO OSCURO EN SESSION STORAGE
    useEffect(() => {
        // WHEN THE VALUE OF `isDarkMode` CHANGES, KEEP THE STATE IN THE SESSIONSTORAGE
        // CUANDO EL VALOR DE `isDarkMode` CAMBIE, GUARDA EL ESTADO EN EL SESSIONSTORAGE
        sessionStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);


    // CALL onEntrySubmit WHEN THE COMPONENT MOUNTS OR THE ACTIVE START DATE CHANGES
    // LLAMA A onEntrySubmit CUANDO EL COMPONENTE SE MONTA O CUANDO CAMBIA LA FECHA INICIAL ACTIVA
    useEffect(() => {
        onEntrySubmit(); // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeStartDate]);

    // FUNCTION TO DELETE AN ENTRY
    // FUNCIÓN PARA ELIMINAR UNA ENTRADA
    const handleDelete = async (id, date) => {
        // OPEN THE DATABASE
        // ABRE LA BASE DE DATOS
        const db = await openDatabase();
        // START A TRANSACTION IN 'READWRITE' MODE TO MODIFY DATA
        // INICIA UNA TRANSACCION EN MODO 'READWRITE' PARA MODIFICAR DATOS
        const transaction = db.transaction('entries', 'readwrite');
        // ACCESS THE 'entries' OBJECT STORE
        // ACCEDE AL ALMACEN DE OBJETOS 'entries'
        const store = transaction.objectStore('entries');

        // DELETE THE ENTRY WITH THE SPECIFIED ID
        // ELIMINA LA ENTRADA CON EL ID ESPECIFICADO
        const request = store.delete(id);

        // HANDLE SUCCESSFUL DELETION
        // MANEJA LA ELIMINACIÓN EXITOSA
        request.onsuccess = () => {
            // UPDATE THE STATE TO REMOVE THE DELETED ENTRY
            // ACTUALIZA EL ESTADO PARA ELIMINAR LA ENTRADA ELIMINADA
            setEntries((prevEntries) => {
                // MAKE A COPY OF THE PREVIOUS ENTRIES
                // HAZ UNA COPIA DE LAS ENTRADAS ANTERIORES
                const updatedEntries = { ...prevEntries };
                // REMOVE THE ENTRY WITH THE GIVEN ID FROM THE SPECIFIED DATE
                // ELIMINA LA ENTRADA CON EL ID DADO DE LA FECHA ESPECIFICADA
                updatedEntries[date] = Array(updatedEntries[date]).filter((entry) => entry.id !== id);
                // RETURN THE UPDATED ENTRIES
                // DEVUELVE LAS ENTRADAS ACTUALIZADAS
                return updatedEntries;
            });
            // REFRESH THE STATE BY FETCHING ALL ENTRIES AGAIN
            // REFRESCA EL ESTADO VOLVIENDO A OBTENER TODAS LAS ENTRADAS
            onEntrySubmit();
        };
        // HANDLE ERRORS DURING DELETION
        // MANEJA LOS ERRORES DURANTE LA ELIMINACIÓN
        request.onerror = (event) => {
            // LOG THE ERROR TO THE CONSOLE
            // REGISTRA EL ERROR EN LA CONSOLA
            console.error('ERROR AL BORRAR LA ENTRADA:', event.target.error);
        };
    };

    // FUNCTION TO SELECT THE CURRENT DATE  
    // FUNCIÓN PARA SELECCIONAR LA FECHA ACTUAL
    const handleCurrentDate = () => {
        const today = new Date();
        setDate(today);
        setActiveStartDate(today); // Esto actualizará la vista del calendario al mes actual
    };

    return (
        <div>
            <div className="header">
                <DarkMode onToggle={handleToggle} />
                <LanguageSelector />
                <img className="app-title-img" src={`${isDarkMode ? process.env.PUBLIC_URL + '/title/dark-title.png' : process.env.PUBLIC_URL + '/title/title.png'}`} alt="app title" />
            </div>

            <div className="current-date-container">
                <button className="current-date" onClick={handleCurrentDate}>{t("current-date")}</button>
            </div>
            <Calendar
                onChange={onDateChange}
                value={date}
                locale={language}
                showNeighboringMonth={false}
                onActiveStartDateChange={handleActiveStartDateChange}
                tileClassName={({ date }) => {
                    const dateString = date.toLocaleDateString(userLocale);
                    return entries[dateString] || '';
                }}
                tileDisabled={tileDisabled}
                activeStartDate={activeStartDate} // Asegura que el calendario refleje el mes correcto
            />
            <EntryContainer date={date} onEntrySubmit={onEntrySubmit} entries={entries} deleteEntry={handleDelete} />
        </div>
    );
};

export default Main;
