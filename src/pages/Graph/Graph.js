import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './Graph.css';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { parse, format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registro de los componentes de Chart.js necesarios
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Etiquetas para los estados de ánimo
const moodLabels = {
  1: 'MUY MAL',
  2: 'MAL',
  3: 'ALGO MAL',
  4: 'NORMAL',
  5: 'ALGO BIEN',
  6: 'BIEN',
  7: 'MUY BIEN'
};

// Función para convertir una etiqueta de estado de ánimo en un valor numérico
const getMoodValue = (mood) => {
  const moodMap = {
    'MUY MAL': 1,
    'MAL': 2,
    'ALGO MAL': 3,
    'NORMAL': 4,
    'ALGO BIEN': 5,
    'BIEN': 6,
    'MUY BIEN': 7
  };
  return moodMap[mood] || 4; // Por defecto, devuelve 4 (NORMAL)
};

const Graph = () => {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: []
  });
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true); // Estado para gestionar la carga

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const request = indexedDB.open('diaryDB', 1);

        // Configuración de la base de datos si no existe
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('entries')) {
            const store = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
            store.createIndex('date', 'date'); // Índice para buscar por fecha
          }
        };

        // Al abrir la base de datos con éxito
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction('entries', 'readonly');
          const store = transaction.objectStore('entries');
          const getAllRequest = store.getAll();

          // Obtener todas las entradas
          getAllRequest.onsuccess = () => {
            let storedEntries = getAllRequest.result;

            // Ordenar las entradas por fecha usando `date-fns`
            storedEntries = storedEntries.sort((a, b) => {
              const dateA = parse(a.date, 'dd/MM/yyyy', new Date(), { locale: es });
              const dateB = parse(b.date, 'dd/MM/yyyy', new Date(), { locale: es });
              return isValid(dateA) && isValid(dateB) ? dateA - dateB : 0;
            });

            // Filtrar las entradas del mes y año actuales
            const entriesThisMonth = storedEntries.filter(entry => {
              const entryDate = parse(entry.date, 'dd/MM/yyyy', new Date(), { locale: es });
              return isValid(entryDate) && entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
            });

            // Agrupar entradas por día
            const groupedByDay = entriesThisMonth.reduce((acc, entry) => {
              const entryDate = parse(entry.date, 'dd/MM/yyyy', new Date(), { locale: es });
              const entryDay = entryDate.getDate();

              if (!acc[entryDay]) acc[entryDay] = [];
              acc[entryDay].push(entry);
              return acc;
            }, {});

            // Generar un array de días del mes actual
            const daysArray = Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }, (_, i) => i + 1);

            // Crear los datos para la gráfica
            const moodData = [];
            const moodColors = [];

            daysArray.forEach(day => {
              const dayEntries = groupedByDay[day];
              if (dayEntries && dayEntries.length > 0) {
                dayEntries.forEach(entry => {
                  const moodValue = getMoodValue(entry.moodLabel ? entry.moodLabel : 4);
                  const color = entry.moodColor;
                  moodData.push(moodValue);
                  moodColors.push(color);
                });
              } else {
                moodData.push(4); // Valor por defecto
                moodColors.push('rgba(75, 192, 192, 1)'); // Color por defecto
              }
            });

            // Actualizar los datos de la gráfica
            setGraphData({
              labels: daysArray,
              datasets: [{
                label: 'Estado de Ánimo',
                data: moodData,
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1,
                pointBackgroundColor: moodColors,
                pointRadius: 6,
                pointBorderWidth: 2,
                pointBorderColor: '#fff',
              }]
            });

            setLoading(false); // Finaliza la carga
          };

          getAllRequest.onerror = () => {
            console.error('Error al obtener las entradas de la base de datos');
            setLoading(false); // En caso de error, termina la carga
          };
        };

        request.onerror = () => {
          console.error('Error al abrir la base de datos');
          setLoading(false); // En caso de error, termina la carga
        };
      } catch (error) {
        console.error('Error al cargar las entradas de la base de datos:', error);
        setLoading(false); // En caso de error, termina la carga
      }
    };

    loadEntries();
  }, [currentMonth, currentYear]);

  // Función para ir al mes actual
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  useEffect(() => {
    console.log(graphData); // Este console.log se ejecutará cada vez que graphData cambie
  }, [graphData]); // Se activa solo cuando graphData cambia
  
  // Funciones para navegar entre meses y años
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToSameMonthLastYear = () => {
    setCurrentYear(currentYear - 1);
  };

  const goToSameMonthNextYear = () => {
    setCurrentYear(currentYear + 1);
  };

  return (
    <div className="graph-container">
      <h2>Gráfica de Estados de Ánimo</h2>

      {/* Fila 1 */}
      <div className='graph-menu-display-first'>
        <button onClick={goToCurrentMonth} className='graph-menu-button'>Mes Actual</button>
      </div>

      {/* Fila 2 */}
      <div className='graph-menu-display-second'>
        <button onClick={goToPreviousMonth} className='graph-menu-button'>
          <MdKeyboardArrowLeft />
          Mes Anterior
        </button>
        <span className='graph-date'>
          {format(new Date(currentYear, currentMonth), 'MMMM yyyy', { locale: es })}
        </span>
        <button onClick={goToNextMonth} className='graph-menu-button'>
          Mes Siguiente
          <MdKeyboardArrowRight />
        </button>
      </div>

      {/* Fila 3 */}
      <div className='graph-menu-display-third'>
        <button onClick={goToSameMonthLastYear} className='graph-menu-button'>
          <MdKeyboardDoubleArrowLeft />
          Año Anterior
        </button>
        <button onClick={goToSameMonthNextYear} className='graph-menu-button'>
          Año Siguiente
          <MdKeyboardDoubleArrowRight />
        </button>
      </div>

      <div className="graph-wrapper">
        <div className="graph-content">
          {loading ? (
            <p>Cargando...</p>
          ) : graphData.labels.length > 0 ? (
            <Line
              data={graphData}
              options={{
                responsive: true,
                maintainAspectRatio: true, // Esto ayudará a que el gráfico se ajuste al tamaño del contenedor
                interaction: {
                  mode: 'nearest',  // 'nearest' detecta el punto más cercano al toque o clic
                  axis: 'x',        // Limita la interacción solo al eje X (si es necesario)
                  intersect: true, // Permite que se muestre el tooltip incluso si el puntero no está exactamente sobre el punto
                },
                scales: {
                  y: {
                    min: 1,  // Asegúrate de que el rango esté correcto
                    max: 7,
                    ticks: {
                      stepSize: 1,
                      callback: (value) => moodLabels[value] || value,
                    },
                    offset: true,
                  },
                  x: {
                    min: graphData.labels[0],
                    max: graphData.labels[graphData.labels.length - 1],
                    ticks: {
                      autoSkip: false,
                      maxRotation: 0,
                    },
                    categoryPercentage: 0.5,
                    barPercentage: 0.5,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    enabled: true,  // Asegúrate de que los tooltips estén habilitados
                    callbacks: {
                      label: (tooltipItem) => {
                        const moodValue = tooltipItem.raw;
                        const moodText = moodLabels[moodValue] || 'Sin Estado';
                        return `Estado de Ánimo: ${moodText}`;
                      },
                    },
                  },
                },
              }}
            />
          ) : (
            <p>No hay datos disponibles para mostrar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Graph;
