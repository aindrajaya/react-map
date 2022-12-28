import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

import { defaultIcon } from '../assets/icons';

//data import
import {cities} from '../data/cities';

const MarkerLayer = ({data}) => {
  return data.features?.map((feature, idx) => {
    const {coordinates} = feature.geometry;

    return (
      <Marker key={idx} position={[coordinates[1], coordinates[0]]} icon={defaultIcon}>
        <Popup>
          This is the town. <br />You can customize it
        </Popup>
      </Marker>
    )
  }) 
}

const Map = () => {
  const positionMadiun = [-7.629900, 111.517113];
  const positionRomania = [45.943161, 24.966761]

  return (
    <MapContainer center={positionRomania} zoom={4} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerLayer data={cities}/>
    </MapContainer>
  )
}

export default Map