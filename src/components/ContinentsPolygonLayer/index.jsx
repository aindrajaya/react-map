import React from 'react';
import { GeoJSON } from 'react-leaflet';

const ContinentsPolygonLayer = ({data}) => {
  return (
    <GeoJSON key='geo-json-layer' data={data}>

    </GeoJSON>
  )
}

export default ContinentsPolygonLayer;