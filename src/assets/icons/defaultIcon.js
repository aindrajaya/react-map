import L from 'leaflet';
import iconUrl from '../images/marker-icon.png';
import iconShadow from '../images/marker-shadow.png';

//to check the default icon
// console.log(L.Marker.prototype.options.icon.options);

const {shadowSize, iconAnchor, popupAnchor, tooltipAnchor} = L.Marker.prototype.options.icon.options;

export const defaultIcon = L.icon({
  iconUrl,
  iconShadow,
  iconSize: [20,20], //not using default size
  shadowSize,
  iconAnchor,
  popupAnchor,
  tooltipAnchor
})