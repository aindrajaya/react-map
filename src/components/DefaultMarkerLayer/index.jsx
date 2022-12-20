import React from 'react';
import { Marker, Popup } from 'react-leaflet';

import CardPopup from '../CardPopup';

const DefaultMarkerLayer = ({data, icon}) => {
  return data.features?.map((feature, idx) => {
    const {coordinates} = feature.geometry;

    return (
      <Marker key={idx} position={[coordinates[1], coordinates[0]]} icon={icon}>
        {/* <PopupStatistics /> */}
        <Popup>
          <CardPopup properties={feature.properties}/>
        </Popup>
      </Marker>
    )
  }) 
}

export default DefaultMarkerLayer;