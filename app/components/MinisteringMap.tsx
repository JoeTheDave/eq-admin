import { useEffect } from 'react';
import { useGoogleMaps } from 'react-hook-google-maps';
import { flatten } from 'lodash';
import useQueryStringNavigator from '~/architecture/hooks/useQueryStringNavigator';
import MapControls from '~/components/MapControls';

import type { FC } from 'react';
import type { PersonWithFamily } from '~/architecture/types';
import type { Family } from '@prisma/client';

interface MinisteringMapProps {
  ministers: PersonWithFamily[];
  families: Family[];
  apiKey: string;
}

let mapMarkers: any[] = [];

const MinisteringMap: FC<MinisteringMapProps> = ({
  ministers,
  families,
  apiKey,
}) => {
  const { ref, map, google } = useGoogleMaps(apiKey, {
    center: { lat: 39.0628883, lng: -94.6942146 },
    zoom: 12,
  });

  const queryStringNavigator = useQueryStringNavigator();
  const activityTypes = queryStringNavigator.getValues('show');
  const selectedMinisterIds = queryStringNavigator.getValues('ministers');

  const createMapMarker = ({
    family,
    color = 'red',
  }: {
    family: Family;
    color?: String;
  }) => {
    const marker = new google.maps.Marker({
      map,
      position: { lat: family.lat, lng: family.lng },
      icon: {
        url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      },
    });

    const infowindow = new google.maps.InfoWindow({
      content: `<div class="info-content"><div style="font-weight: bold;">${
        family.name
      }</div>${family.address
        .split('\n')
        .map((addressPart) => `<div>${addressPart}</div>`)
        .join('')}</div>${
        family.active
          ? '<div class="info-status-active">ACTIVE</div>'
          : family.active === false
          ? '<div class="info-status-inactive">INACTIVE</div>'
          : '<div class="info-status-unknown">UNKNOWN</div>'
      }`,
      shouldFocus: false,
      disableAutoPan: true,
    });

    marker.addListener('mouseover', function () {
      infowindow.open(map, marker);
    });

    marker.addListener('mouseout', function () {
      infowindow.close();
    });

    return marker;
  };

  useEffect(() => {
    if (google) {
      mapMarkers.forEach((marker) => marker.setMap(null));
      mapMarkers = flatten([
        ministers
          .filter((minister) => selectedMinisterIds.includes(minister.id))
          .map((minister) => minister.family)
          .map((fam) => createMapMarker({ family: fam, color: 'blue' })),
        families.map((fam) => createMapMarker({ family: fam })),
      ]);
    }
  }, [activityTypes, ministers, map]);

  return (
    <div id="map-container">
      <MapControls />
      <div id="map-content" ref={ref}></div>
    </div>
  );
};
export default MinisteringMap;
