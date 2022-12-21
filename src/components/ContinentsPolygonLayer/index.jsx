import React from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';

const ContinentsPolygonLayer = ({data, setGeoFilter}) => {
  return (
    <GeoJSON 
      key='geo-json-layer' 
      data={data} 
      eventHandlers={{
        click: (e) => setGeoFilter((prevState) => {
          const sameValue = prevState === e.propagatedFrom.feature;
          return sameValue ? null: e.propagatedFrom.feature;
        })
      }}
      // onMouseOver={(e) => {
      //   e.target.openTooltip()
      // }}
      // onMouseOut={(e) => {
      //   e.target.closeTooltip();
      // }}
    >
      {/* <Tooltip>Click again to Clear Geo Filter</Tooltip> */}
    </GeoJSON>
  )
}

export default ContinentsPolygonLayer;