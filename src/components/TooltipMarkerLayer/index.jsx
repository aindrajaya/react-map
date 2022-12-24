import React from 'react';
import {LayersControl, Marker, Tooltip, useMap, LayerGroup } from 'react-leaflet';

const TooltipMarkerLayer = ({data, icon}) => {
  const leafletMap = useMap()
  const layer = data.features.map((feature, idx) => {
    const {coordinates} = feature.geometry;
    const {name, elevation, continent} = feature.properties;

    return (
      <Marker 
        key={idx} 
        position={[coordinates[1], coordinates[0]]} 
        zIndexOffset='999'
        icon={icon}
        eventHandlers={{
          click: (e) => leafletMap.panTo(e.latlng)
        }}
        >
        <Tooltip>
          <h3>Mt. {name}</h3>
          Continent: <b>{continent}</b> <br/>
          Elevation: <b>{elevation} m</b>
        </Tooltip>
      </Marker>
    );
  });
  return (
    <LayersControl.Overlay checked name='Mountains Layer'>
      <LayerGroup>
        {layer}
      </LayerGroup>
    </LayersControl.Overlay>
  )
}

export default TooltipMarkerLayer;