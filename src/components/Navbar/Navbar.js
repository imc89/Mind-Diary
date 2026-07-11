import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { exportToCSV } from '../FileTransfer/ExportFile/ExportFile';
import { FaExchangeAlt } from "react-icons/fa";
import { BiExport, BiImport } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import Papa from 'papaparse';
import './Navbar.css';

const Navbar = ({ t }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileName, setFileName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");  // Mensaje dinámico del modal
    const [modalClass, setModalClass] = useState("modal"); //clase de css de la moda
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

    const openModal = (message, action, showCancelButton = true, modalClass = "modal") => {
        setModalMessage(message);
        setModalAction(() => action);
        setShowCancelButton(showCancelButton);
        setModalClass(modalClass);  // Guardamos la clase personalizada del modal
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
                            openModal(t('modal-import-success'), () => window.location.reload(), false, "modal-delete");
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
            closeImportModal();
            openModal(t('modal-import-invalid'), () => { }, false, "modal-delete");
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className='home-container' onClick={closeMenus}>
                    <img src={`${process.env.PUBLIC_URL}/title/title.png`} alt="Logo" className="navbar-logoimg" />
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
                    <Link to="/search" onClick={closeMenus}> <li className="navbar-item">{t('navbar-search-text')}</li> </Link>
                    <Link to="/image" onClick={closeMenus}> <li className="navbar-item">{t('navbar-search-img')}</li> </Link>
                    <Link to="/graph" onClick={closeMenus}> <li className="navbar-item">{t('navbar-graph')}</li> </Link>
                    <Link to="/help" onClick={closeMenus}> <li className="navbar-item">{t('navbar-help')}</li> </Link>
                    <li className='navbar-item desktop-only' onClick={toggleTransfer}>
                        <FaExchangeAlt />
                    </li>
                </ul>
                <ul className={`transfer ${isTransferOpen ? 'active' : ''}`}>
                    <li className="transfer-icon export" onClick={() => { exportToCSV(); closeMenus(); }}>
                        <BiExport />
                        <span className='export-tag'>{t('navbar-export')}</span>
                    </li>
                    <li className="transfer-icon import" onClick={openImportModal}>
                        <BiImport />
                        <span className='import-tag'>{t('navbar-import')}</span>
                    </li>
                    <li className="transfer-icon delete" onClick={() => openModal("¿ESTÁS SEGURO DE QUE DESEAS ELIMINAR TODO EL CONTENIDO DE LA APLICACIÓN?", deleteIndexedDB)}>
                        <MdDelete />
                        <span className='delete-tag'>{t('navbar-delete')}</span>
                    </li>
                </ul>
            </div>

            {/* Modal reutilizable */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className={showCancelButton ? "modal-delete" : modalClass}>
                        <p>{modalMessage}</p>
                        <div className="modal-buttons">
                            <button onClick={() => { modalAction(); closeModal(); }} className="modal-accept">{t('modal-accept')}</button>
                            {showCancelButton && (
                                <button onClick={closeModal} className="modal-cancel">{t('modal-cancel')}</button>
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
                            {t('modal-import')}
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
                            {t('modal-cancel')}
                        </button>
                    </div>
                </div>
            )}

        </nav>
    );
};

export default Navbar;
