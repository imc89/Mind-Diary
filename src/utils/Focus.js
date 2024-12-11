import { useEffect } from 'react';

const Focus = () => {
    // We add the effect of the focus since on mobile devices it is not functional from css
    // Añadimos el efecto del focus ya que en dispositivos moviles no es funcional desde css
    useEffect(() => {
        // Select all the elements with the class .react-calendar__tile
        // Selecciona todos los elementos con la clase .react-calendar__tile
        const tiles = document.querySelectorAll('.react-calendar__tile');

        // Runs through each tile and add the click handler
        // Itera sobre cada tile y agrega el manejador de click
        tiles.forEach((tile) => {
            const handleClick = () => {
                tile.focus(); // Add focus on each tile - Agregar focus a cada celda del calendario
            };

            tile.addEventListener('click', handleClick);

            // Clean up the event listener on component unmount
            // Limpiar los eventos al desmontar el componente
            return () => {
                tile.removeEventListener('click', handleClick);
            };
        });
    }, []);
};

export default Focus;