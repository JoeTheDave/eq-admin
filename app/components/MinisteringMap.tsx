import { useState, useEffect } from 'react';
import { useGoogleMaps } from 'react-hook-google-maps';
import { flatten } from 'lodash';
import cc from 'classcat';
import Button from '@mui/material/Button';

import type { FC } from 'react';
import type { PersonWithFamily } from '~/architecture/types';
import type { Family } from '@prisma/client';

interface MinisteringMapProps {
  ministers: PersonWithFamily[];
  selectedMinisterIds: string[];
  families: Family[];
}

let mapMarkers: any[] = [];

const MinisteringMap: FC<MinisteringMapProps> = ({
  ministers,
  selectedMinisterIds,
  families,
}) => {
  const [mapToolsOpen, setMapToolsOpen] = useState<boolean>(false);

  const { ref, map, google } = useGoogleMaps(
    'AIzaSyC-d1WM72-74auAY0USczfUb68ZAgbjxec',
    {
      center: { lat: 39.0628883, lng: -94.6942146 },
      zoom: 12,
    },
  );

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
  }, [selectedMinisterIds, map]);

  return (
    <div id="map-container">
      <div id="map-controls">
        <div id="map-controls-button">
          <Button
            color="warning"
            variant="contained"
            onClick={() => setMapToolsOpen(!mapToolsOpen)}
          >
            Tools
          </Button>
        </div>
        <div
          className={cc({
            'map-controls-content': true,
            'tools-open': mapToolsOpen,
          })}
        ></div>
      </div>
      <div id="map-content" ref={ref}></div>
    </div>
  );
};
export default MinisteringMap;
