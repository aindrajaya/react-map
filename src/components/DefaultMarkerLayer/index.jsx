import React from 'react';
import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet';

import CardPopup from '../CardPopup';

const DefaultMarkerLayer = ({data, icon, setRadiusFilter, getRadiusFilter}) => {
  const radiusFilter = getRadiusFilter();

  //Function to define the center point of Radius filter
  let centerPoint;
  if(radiusFilter){
    const {coordinates} = radiusFilter.feature.geometry;
    centerPoint = L.latLng(coordinates[1], coordinates[0]);
  }

  console.log(radiusFilter);
  return data.features.filter((currenFeature) => {
    if(centerPoint){
      const {coordinates} = currenFeature.geometry;
      const currentPoint = L.latLng(coordinates[1], coordinates[0]);
      return centerPoint.distanceTo(currentPoint) / 1000 < radiusFilter.radius;
    } else {
      return true;
    }
  })
  .map((feature, idx) => {
    const {coordinates} = feature.geometry;

    return (
      <Marker key={idx} position={[coordinates[1], coordinates[0]]} icon={icon}>
        {/* <PopupStatistics /> */}
        <Popup>
          <CardPopup feature={feature} setRadiusFilter={setRadiusFilter}/>
        </Popup>
      </Marker>
    )
  }) 
}

export default DefaultMarkerLayer;