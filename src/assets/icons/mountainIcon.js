import L from 'leaflet';

import mountain from '../images/mountains.png';

const LeafIcon = L.Icon.extend({
  options: {
    iconSize: [30, 30],
    // iconAnchor: [17, 16] for positioning the center of the icon
    // tooltipAnchor: [15, -5] for positioning the pointer, to trigger the tooltip
  },
});

export const mountainIcon = new LeafIcon({iconUrl: mountain})