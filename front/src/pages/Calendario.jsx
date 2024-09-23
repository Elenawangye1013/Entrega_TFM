import React, { useEffect, useState } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import moment from 'moment';
import './styles/Calendario.css';

const localizer = momentLocalizer(moment);

const Calendario = ({ eventsProp }) => {
  const [events, setEvents] = useState([]);
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/get-citas', {
          params: { email }
        });

        return response.data.map(cita => ({
          title: cita.title,
          start: new Date(cita.start),
          end: new Date(cita.end),
          type: 'cita'
        }));
      } catch (error) {
        console.error('Error fetching citas:', error);
        return [];
      }
    };

    const fetchMedicamentos = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/get-medicamentos', {
          params: { email }
        });

        console.log('Medicamentos data:', response.data);

        return response.data.flatMap(med => {
          const startDateTime = new Date(`${med.fecha_inicio.slice(0, 10)}T${med.hora_toma}`);
          const endDate = new Date(med.fecha_fin);
          const intervaloHoras = parseInt(med.intervalo_toma);

          if (isNaN(startDateTime.getTime()) || isNaN(endDate.getTime()) || isNaN(intervaloHoras)) {
            console.error('Fecha o intervalo inválido:', med.nombre_medicamento, startDateTime, endDate);
            return [];
          }

          const eventos = [];
          for (let date = new Date(startDateTime); date <= endDate; date.setHours(date.getHours() + intervaloHoras)) {
            eventos.push({
              id: `${med.id}-${date.getTime()}`, 
              title: `Medicamento: ${med.nombre_medicamento} para ${med.nombre_mascota} - Dosis: ${med.dosis} - Notas: ${med.notas}`,
              start: new Date(date),
              end: new Date(date.getTime() + 10 * 60000),
              type: 'medicamento'
            });
          }
          return eventos;
        });
      } catch (error) {
        console.error('Error fetching medicamentos:', error);
        return [];
      }
    };

    const fetchAllEvents = async () => {
      const [citas, medicamentos] = await Promise.all([fetchCitas(), fetchMedicamentos()]);
      setEvents([...citas, ...medicamentos]);
    };

    fetchAllEvents();
  }, [email, eventsProp]);

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: event.type === 'medicamento' ? '#FEFAE0' : '#EA5141',
      color: event.type === 'medicamento' ? 'black' : 'white',
    };
    return {
      style: style
    };
  };

  return (
    <div className="calendar-container">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '500pt' }}
        eventPropGetter={eventStyleGetter} 
      />
    </div>
  );
};

export default Calendario;
