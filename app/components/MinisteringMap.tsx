import { useEffect } from 'react';
import { useGoogleMaps } from 'react-hook-google-maps';
import { flatten, groupBy } from 'lodash';
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
    const fams = flatten(
      Object.values(
        groupBy(families, (fam) => fam.address.split('\n')[0].toLowerCase()),
      ).map((famGroup) => {
        if (famGroup.length === 1) {
          return famGroup;
        }
        const avgLat = (famGroup[0].lat + famGroup[1].lat) / 2;
        const avgLng = (famGroup[0].lng + famGroup[1].lng) / 2;

        famGroup[0].lat = avgLat;
        famGroup[0].lng = avgLng - 0.00005;
        famGroup[1].lat = avgLat;
        famGroup[1].lng = avgLng + 0.00005;
        return famGroup;
      }),
    );

    const activeFamilies = fams.filter((fam) => fam.active);
    const unknownFamilies = fams.filter((fam) => fam.active === null);
    const inactiveFamilies = fams.filter((fam) => fam.active === false);

    if (google) {
      mapMarkers.forEach((marker) => marker.setMap(null));
      mapMarkers = flatten([
        ministers
          .filter((minister) => selectedMinisterIds.includes(minister.id))
          .map((minister) => minister.family)
          .map((fam) => createMapMarker({ family: fam, color: 'blue' })),

        activeFamilies.map((fam) =>
          createMapMarker({ family: fam, color: 'green' }),
        ),
        unknownFamilies.map((fam) =>
          createMapMarker({ family: fam, color: 'yellow' }),
        ),
        inactiveFamilies.map((fam) =>
          createMapMarker({ family: fam, color: 'pink' }),
        ),
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
