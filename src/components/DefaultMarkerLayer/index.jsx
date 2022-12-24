import React from 'react';
import L from 'leaflet'
import {LayersControl, Marker, Popup, LayerGroup } from 'react-leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import CardPopup from '../CardPopup';

const DefaultMarkerLayer = ({data, icon, setRadiusFilter, getRadiusFilter, getGeoFilter}) => {
  const radiusFilter = getRadiusFilter();
  const geoFilter = getGeoFilter();

  //Function to define the center point of Radius filter
  let centerPoint;
  if(radiusFilter){
    const {coordinates} = radiusFilter.feature.geometry;
    centerPoint = L.latLng(coordinates[1], coordinates[0]);
  }

  // console.log(radiusFilter);
  const layer = data.features
  .filter((currenFeature) => {
    let filterByRadius;
    let filterByGeo;
    if(centerPoint){
      const {coordinates} = currenFeature.geometry;
      const currentPoint = L.latLng(coordinates[1], coordinates[0]);
      filterByRadius = centerPoint.distanceTo(currentPoint) / 1000 < radiusFilter.radius;
    }

    if(geoFilter){
      filterByGeo = booleanPointInPolygon(currenFeature, geoFilter)
    }

    let doFilter = true;
    if(geoFilter && radiusFilter) {
      doFilter = filterByGeo && filterByRadius;
    } else if(geoFilter && !radiusFilter){
      doFilter = filterByGeo;
    } else if(radiusFilter && !geoFilter){
      doFilter = filterByRadius;
    }
    return doFilter;
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
    );
  });
  return (
  <LayersControl.Overlay checked name='World Cities'>
    <LayerGroup>
      {layer}
    </LayerGroup>
  </LayersControl.Overlay> )
}

export default DefaultMarkerLayer;