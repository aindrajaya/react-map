import L from 'leaflet';
import iconUrl from '../images/marker-icon.png';
import iconShadow from '../images/marker-shadow.png';

//to check the default icon
// console.log(L.Marker.prototype.options.icon.options);

const {iconSize, shadowSize, iconAnchor, popupAnchor, tooltipAnchor} = L.Marker.prototype.options.icon.options;

export const defaultIcon = L.icon({
  iconUrl,
  iconShadow,
  iconSize,
  shadowSize,
  iconAnchor,
  popupAnchor,
  tooltipAnchor
})