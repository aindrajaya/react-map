import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import { defaultIcon } from '../assets/icons';

const MarkerLayer = ({pos}) => {
  return (
    <Marker position={pos} icon={defaultIcon}>
      <Popup>
        This is the town. <br />You can customize it
      </Popup>
    </Marker>
  )
}

const Map = () => {
  const position = [-7.629900, 111.517113];

  return (
    <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerLayer pos={position} />
    </MapContainer>
  )
}

export default Map