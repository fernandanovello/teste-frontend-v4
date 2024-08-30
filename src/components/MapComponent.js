import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import equipmentPositionHistory from '../data/equipmentPositionHistory.json';
import equipmentStateHistory from '../data/equipmentStateHistory.json';
import equipmentState from '../data/equipmentState.json';
import Modal from 'react-modal';


Modal.setAppElement('#root'); 

const customIcon = new L.Icon({
  iconUrl: '/icons/icone.png', 
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const MapComponent = () => {
  const [data, setData] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  useEffect(() => {
    const latestData = {};

    console.log("Carregando dados de posição...");
    console.log(equipmentPositionHistory);

    equipmentPositionHistory.forEach(entry => {
      const { equipmentId, name, position, timestamp } = entry;

      if (!latestData[equipmentId] || new Date(timestamp) > new Date(latestData[equipmentId].timestamp)) {
        const stateHistory = equipmentStateHistory.find(e => e.equipmentId === equipmentId);
        console.log("Histórico de estado encontrado:", stateHistory);

        if (stateHistory) {
          const latestStateEntry = stateHistory.states[stateHistory.states.length - 1];
          const latestState = equipmentState.find(state => state.id === latestStateEntry.equipmentStateId);

          console.log("Último estado:", latestState);

          latestData[equipmentId] = {
            name,
            position,
            timestamp,
            state: latestState ? latestState.name : "Desconhecido",
            color: latestState ? latestState.color : "#000000",
            stateHistory: stateHistory.states
          };
        }
      }
    });

    console.log("Dados finais:", Object.values(latestData));
    setData(Object.values(latestData));
  }, []);

  const handleMarkerClick = (equipment) => {
    setSelectedEquipment(equipment);
  };

  const closeModal = () => {
    setSelectedEquipment(null);
  };

  return (
    <div>
      <MapContainer center={[-19.126536, -45.947756]} zoom={13} style={{ height: '100vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.map((equipment, index) => (
          <Marker 
            key={index} 
            position={equipment.position} 
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(equipment)
            }}
          >
            <Popup>
              <div>
                <strong>{equipment.name}</strong><br />
                Estado: <span style={{color: equipment.color}}>{equipment.state}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedEquipment && (
        <Modal isOpen={true} onRequestClose={closeModal} contentLabel="Histórico de Estados">
          <h2>{selectedEquipment.name}</h2>
          <button onClick={closeModal}>Fechar</button>
          <h3>Histórico de Estados</h3>
          <ul>
            {selectedEquipment.stateHistory.length > 0 ? (
              selectedEquipment.stateHistory.map((stateEntry, index) => {
                const state = equipmentState.find(s => s.id === stateEntry.equipmentStateId);
                return (
                  <li key={index}>
                    <span style={{color: state ? state.color : '#000'}}>{state ? state.name : 'Desconhecido'}</span> - {new Date(stateEntry.timestamp).toLocaleString()}
                  </li>
                );
              })
            ) : (
              <li>Nenhum histórico de estado encontrado.</li>
            )}
          </ul>
        </Modal>
      )}
    </div>
  );
};

export default MapComponent;
