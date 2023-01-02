import React from 'react';
import { Circle, LayersControl, Tooltip } from 'react-leaflet';

const RadiusFilterLayer = ({radiusFilter, setRadiusFilter}) => {
  if(radiusFilter){
    const {coordinates} = radiusFilter.feature.geometry;
    const layer = <Circle 
        center={[coordinates[1], coordinates[0]]}
        radius={radiusFilter.radius * 1000}
        eventHandlers={{
          dblclick: (e) => {
            e.originalEvent.view.L.DomEvent.stopPropagation(e)
            setRadiusFilter(null);
          },
        }}
        /**
           * It will be function to show tooltip when moustover the circle
           */
        onMouseOver={(e) => {
          e.target.openTooltip()
        }}
        onMouseOut={(e) => {
          e.target.closeTooltip();
        }}
        color={'#57b83b'}
        weight={1}
        fillOpacity={0.2}
      >
        <Tooltip>Double click to close!</Tooltip>
      </Circle>
    return (
      <LayersControl.Overlay>
        {layer}
      </LayersControl.Overlay>
    )
  } else {
    return null;
  }
}

export default RadiusFilterLayer;