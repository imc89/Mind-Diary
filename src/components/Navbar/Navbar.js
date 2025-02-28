import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { exportToCSV } from '../FileTransfer/ExportFile/ExportFile';
import { FaExchangeAlt } from "react-icons/fa";
import { BiExport, BiImport } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Papa from 'papaparse';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");  // Mensaje dinámico del modal
    const [showCancelButton, setShowCancelButton] = useState(true);  // Estado para controlar la visibilidad del botón "Cancelar"
    const [modalAction, setModalAction] = useState(() => () => { });  // Acción que se ejecutará al hacer clic en "Aceptar"

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setIsTransferOpen(false);
    };

    const toggleTransfer = () => {
        setIsTransferOpen(!isTransferOpen);
        setIsMenuOpen(false);
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
        setIsTransferOpen(false);
    };

    const openImportModal = () => {
        setIsImportModalOpen(true);
    };

    const closeImportModal = () => {
        setIsImportModalOpen(false);
        setFileName("");
    };

    const openModal = (message, action, showCancelButton = true) => {
        setModalMessage(message);
        setModalAction(() => action);  // Asignar la acción que se ejecutará al hacer clic en "Aceptar"
        setShowCancelButton(showCancelButton);  // Establecer si el botón "Cancelar" debe mostrarse
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalMessage("");  // Limpiar el mensaje
        setModalAction(() => { });  // Limpiar la acción
    };

    const deleteIndexedDB = () => {
        const request = indexedDB.deleteDatabase("diaryDB");
        request.onsuccess = () => {
            closeModal(); // Cerrar el modal de confirmación
            window.location.reload(); // Refrescar la página
        };
        request.onerror = () => {
            openModal("Error eliminando la base de datos", () => { }); // Mostrar mensaje de error
        };
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        processFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const file = event.dataTransfer.files[0];
        processFile(file);
    };

    const processFile = (file) => {
        if (file && file.name.endsWith('.csv')) {
            setFileName(file.name);

            // Lógica para procesar el archivo CSV
            Papa.parse(file, {
                complete: async (result) => {
                    const request = indexedDB.open("diaryDB", 1);
                    request.onsuccess = async (event) => {
                        const db = event.target.result;
                        const transaction = db.transaction("entries", "readwrite");
                        const store = transaction.objectStore("entries");

                        result.data.forEach(async (entry) => {
                            if (entry.date && entry.entry) {
                                store.add(entry);
                            }
                        });

                        transaction.oncomplete = () => {
                            closeImportModal(); // Cerrar el modal de importación
                            openModal("La importación de datos se completó con éxito.", () => window.location.reload(), false);
                        };

                        transaction.onerror = () => {
                            closeImportModal(); // Cerrar el modal de importación
                            openModal("Error al guardar los datos", () => { }, false); // Mostrar mensaje de error
                        };
                    };

                    request.onerror = () => {
                        closeImportModal(); // Cerrar el modal de importación
                        openModal("Error abriendo la base de datos", () => { }); // Mostrar mensaje de error
                    };
                },
                header: true,  // Si el CSV tiene encabezado
            });
        } else {
            openModal("Por favor, selecciona un archivo .csv válido.", () => { }); // Mensaje de alerta si no es un archivo CSV
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className='home-container' onClick={closeMenus}>
                    <img src={`${process.env.PUBLIC_URL}/icon.png`} alt="Logo" className="navbar-logoimg" />
                    <h1 className="navbar-logo">Mind Diary</h1>
                </Link>
                <div className='mobile-menu'>
                    <button className="navbar-toggle" onClick={toggleMenu}>
                        <span className="navbar-icon"></span>
                        <span className="navbar-icon"></span>
                        <span className="navbar-icon"></span>
                    </button>
                    <button className="navbar-toggle" onClick={toggleTransfer}>
                        <FaExchangeAlt />
                    </button>
                </div>
                <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/search" onClick={closeMenus}> <li className="navbar-item">Búsqueda</li> </Link>
                    <Link to="/image" onClick={closeMenus}> <li className="navbar-item">Imágenes</li> </Link>
                    <Link to="/graph" onClick={closeMenus}> <li className="navbar-item">Gráficos</li> </Link>
                    <Link to="/help" onClick={closeMenus}> <li className="navbar-item">Ayuda</li> </Link>
                    <li className='navbar-item desktop-only' onClick={toggleTransfer}>
                        <FaExchangeAlt />
                    </li>
                </ul>
                <ul className={`transfer ${isTransferOpen ? 'active' : ''}`}>
                    <li className="transfer-icon export" onClick={() => { exportToCSV(); closeMenus(); }}>
                        <BiExport />
                        <span className='export-tag'>EXPORTAR</span>
                    </li>
                    <li className="transfer-icon import" onClick={openImportModal}>
                        <BiImport />
                        <span className='import-tag'>IMPORTAR</span>
                    </li>
                    <li className="transfer-icon delete" onClick={() => openModal("¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR TODO EL CONTENIDO DE LA APLICACIÓN?", deleteIndexedDB)}>
                        <MdDelete />
                        <span className='delete-tag'>ELIMINAR</span>
                    </li>
                </ul>
            </div>

            {/* Modal reutilizable */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>{modalMessage}</p>
                        <div className="modal-buttons">
                            <button onClick={() => { modalAction(); closeModal(); }} className="modal-accept">Aceptar</button>
                            {showCancelButton && (
                                <button onClick={closeModal} className="modal-cancel">Cancelar</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de importación de archivo */}
            {isImportModalOpen && (
                <div
                    className="modal-overlay file-input-text"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <div onClick={() => document.getElementById('file-input').click()} className={`modal ${isDragOver ? 'drag-over' : ''}`}>
                        <p>
                            Selecciona o arrastra un archivo .csv para importar
                        </p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="file-input"
                            style={{ display: 'none' }} // Ocultamos el input de archivos
                            id="file-input"
                        />
                        {fileName && <p className="file-name">Archivo seleccionado: {fileName}</p>}
                        <button onClick={(event) => { event.stopPropagation(); closeImportModal(); }} className="modal-cancel">
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

        </nav>
    );
};

export default Navbar;
