import React from 'react';
import { GeoJSON } from 'react-leaflet';

const ContinentsPolygonLayer = ({data, setGeoFilter, getGeoFilter}) => {
  const geoFilter = getGeoFilter();
  console.log(geoFilter)
  return (
    <GeoJSON 
      key='geo-json-layer' 
      data={data} 
      eventHandlers={{
        click: (e) => setGeoFilter(e.propagatedFrom.feature)
      }}
      >

    </GeoJSON>
  )
}

export default ContinentsPolygonLayer;