import React, {useState} from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

//data import
import {cities} from '../data/cities';
import {mountains} from '../data/mountains';
import {continents} from '../data/continents';

//Marker icon
import { defaultIcon } from '../assets/icons/defaultIcon';
import { mountainIcon } from '../assets/icons/mountainIcon';

//Layer
import { DefaultMarkerLayer, RadiusFilterLayer, TooltipMarkerLayer, ContinentsPolygonLayer } from '../components';

const Map = () => {
  const [radiusFilter, setRadiusFilter] = useState(null);
  const [geoFilter, setGeoFilter] = useState(null);

  const positionMadiun = [-7.629900, 111.517113];
  const positionRomania = [45.943161, 24.966761];

  const getRadiusFilter = () => radiusFilter;
  const getGeoFilter = () => geoFilter;

  return (
    <MapContainer center={positionRomania} zoom={4} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <DefaultMarkerLayer data={cities} icon={defaultIcon} setRadiusFilter={setRadiusFilter} getRadiusFilter={getRadiusFilter} getGeoFilter={getGeoFilter}/>
      <TooltipMarkerLayer data={mountains} icon={mountainIcon}/>
      <RadiusFilterLayer radiusFilter={radiusFilter} setRadiusFilter={setRadiusFilter}/>
      <ContinentsPolygonLayer data={continents} setGeoFilter={setGeoFilter} getGeoFilter={getGeoFilter}/>
    </MapContainer>
  )
}

export default Map