import React from 'react';
import { Marker, Popup } from 'react-leaflet';

const DefaultMarkerLayer = ({data, icon}) => {
  return data.features?.map((feature, idx) => {
    const {coordinates} = feature.geometry;
    const {name, sov0name} = feature.properties

    return (
      <Marker key={idx} position={[coordinates[1], coordinates[0]]} icon={icon}>
        <Popup>
          This is the town of {name} from Country {sov0name}. <br />You can customize it
        </Popup>
      </Marker>
    )
  }) 
}

export default DefaultMarkerLayer;