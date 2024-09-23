import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './styles/Collaborators.css';
import { Typography } from '@mui/material';

const LocationUpdater = ({ positions }) => {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions.map(pos => [pos.lat, pos.lng]));
      map.fitBounds(bounds);
    }
  }, [positions, map]);

  return null;
};

const Collaborators = () => {
  const [position, setPosition] = useState(null);
  const [vets, setVets] = useState([]);
  const [filteredVets, setFilteredVets] = useState([]);
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error al obtener la ubicación: ', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchVets = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/auth/veterinarios'); 
        setVets(response.data);
        setFilteredVets(response.data); 
      } catch (error) {
        console.error('Error fetching veterinarians:', error.message);
      }
    };

    fetchVets();
  }, []);

  useEffect(() => {
    setFilteredVets(
      vets.filter(vet =>
        vet.postalCode.includes(postalCode)
      )
    );
  }, [postalCode, vets]);

  const vetPositions = filteredVets.map(vet => ({
    lat: vet.lat,
    lng: vet.lng,
  }));

  return (
    <div className="collaborators-container">
      <h1>Nuestros Colaboradores</h1>
      <Typography variant="h5" className="collab-subtitle" gutterBottom>
        Veterinarios asociados
      </Typography>
      <p className="p-style">Puedes encontrar aquí todos los centros veterinarios con los que tenemos colaboración, cada uno de ellos son los mejores especialistas.</p>
      <input
        type="text"
        placeholder="Introduce tu código postal para ver los veterinario cercanos"
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
      />
      <MapContainer
        center={position ? [position.lat, position.lng] : [40.712776, -74.005974]}
        zoom={13}
        className="map-container" 
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationUpdater positions={vetPositions} />
        {position && (
          <Marker
            position={[position.lat, position.lng]}
            icon={new L.Icon({
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>Tu ubicación actual</Popup>
          </Marker>
        )}
        {filteredVets.map((vet, index) => (
          <Marker
            key={index}
            position={[vet.lat, vet.lng]}
            icon={new L.Icon({
              iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })}
          >
            <Popup>
              <strong>{vet.nombre}</strong><br />
              {vet.direccion}<br />
              {vet.ciudad}, {vet.provincia}<br />
              {vet.telefono}<br />
              {vet.horario_apertura} - {vet.horario_cierre}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Collaborators;
