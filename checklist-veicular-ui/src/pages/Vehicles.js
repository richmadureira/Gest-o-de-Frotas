
import React, { useState } from 'react';

function Vehicles() {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');

  const handleAddVehicle = (e) => {
    e.preventDefault();
    console.log(`Novo Veículo: Placa ${plate}, Modelo ${model}`);
    // Aqui você pode implementar a lógica para enviar os dados à API
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '1rem' }}>
      <h2>Gestão de Veículos</h2>
      <form onSubmit={handleAddVehicle}>
        <div>
          <label>Placa:</label>
          <input
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            style={{ width: '100%', margin: '0.5rem 0' }}
          />
        </div>
        <div>
          <label>Modelo:</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', margin: '0.5rem 0' }}
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>Adicionar Veículo</button>
      </form>
    </div>
  );
}

export default Vehicles;
