import React from 'react';
import { Marker, Popup } from 'react-leaflet';

//Styling
import { Card } from 'antd';

const DefaultMarkerLayer = ({data, icon}) => {
  return data.features?.map((feature, idx) => {
    const {coordinates} = feature.geometry;
    const {name, sov0name} = feature.properties

    return (
      <Marker key={idx} position={[coordinates[1], coordinates[0]]} icon={icon}>
        {/* <PopupStatistics /> */}
        <Popup>
          <Card type='inner' title={`${name} from ${sov0name}`}>
            Inner Card content
          </Card>
        </Popup>
      </Marker>
    )
  }) 
}

export default DefaultMarkerLayer;