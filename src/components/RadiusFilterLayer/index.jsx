import React from 'react';
import { Circle } from 'react-leaflet';

const RadiusFilterLayer = ({radiusFilter, setRadiusFilter}) => {
  if(radiusFilter){
    const {coordinates} = radiusFilter.feature.geometry;
    return (
      <Circle 
        center={[coordinates[1], coordinates[0]]}
        radius={radiusFilter.radius * 1000}
        eventHandlers={{
          dblclick: (e) => {
            e.originalEvent.view.L.DomEvent.stopPropagation(e)
            setRadiusFilter(null);
          }
        }}
      />
    );
  } else {
    return null;
  }
}

export default RadiusFilterLayer;