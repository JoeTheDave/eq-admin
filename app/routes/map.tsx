import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Fragment, useState, useEffect } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useGoogleMaps } from 'react-hook-google-maps';
import { flatten } from 'lodash';
import stylesUrl from '~/styles/map.css';
import type { Family } from '@prisma/client';
import type { PersonWithFamily } from '~/types/PersonWithFamily';
import { db } from '~/architecture/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = {
  ministers: PersonWithFamily[][];
  families: Family[];
  selectedMinisterIds: String[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const ministersTerm = url.searchParams.get('ministers');

  const people = await db.person.findMany({
    where: {
      isMinister: true,
    },
    include: {
      family: true,
    },
    orderBy: [
      {
        name: 'asc',
      },
    ],
  });

  const letters = 'abcdefghijklmnopqrstuvwxyz';

  const ministers = letters
    .split('')
    .map((letter) =>
      people.filter(
        (minister) => minister.family.surname.toLowerCase()[0] === letter,
      ),
    )
    .filter((letterList) => letterList.length > 0);

  const selectedMinisterIds = ministersTerm ? ministersTerm.split('|') : [];

  const selectedMinisterFamilies = selectedMinisterIds.map(
    (ministerId) =>
      (flatten(ministers).find((m) => m.id === ministerId) as PersonWithFamily)
        .family,
  );

  const query = `
  SELECT *
  FROM (
    SELECT a."destinationFamilyId", (${letters
      .split('')
      .splice(0, selectedMinisterFamilies.length)
      .map((letter) => `${letter}.distance`)
      .join(' + ')}) / ${selectedMinisterFamilies.length} AS "avgDistance"
    ${selectedMinisterFamilies
      .map(
        (family, idx) => `
    ${idx === 0 ? 'FROM' : 'INNER JOIN'} (
      SELECT "sourceFamilyId", "destinationFamilyId", distance
      FROM "Distance"
      WHERE "sourceFamilyId" = '${family.id}'
    ) ${letters[idx]} ${
          idx > 0
            ? `ON ${letters[idx - 1]}."destinationFamilyId" = ${
                letters[idx]
              }."destinationFamilyId"`
            : ''
        }
    `,
      )
      .join('')}
  ) avgDist
  INNER JOIN "Family" f ON avgDist."destinationFamilyId" = f.id
  WHERE f.active = TRUE
  ORDER BY "avgDistance"
  LIMIT 5;
  `;

  const families = selectedMinisterIds.length
    ? await db.$queryRawUnsafe(query)
    : await db.family.findMany({
        where: {
          active: true,
        },
        orderBy: [
          {
            name: 'asc',
          },
        ],
      });

  return {
    ministers,
    families,
    selectedMinisterIds,
  };
};

let mapMarkers: any[] = [];

export default function MapRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const { ref, map, google } = useGoogleMaps(
    'AIzaSyC-d1WM72-74auAY0USczfUb68ZAgbjxec',
    {
      center: { lat: 39.0628883, lng: -94.6942146 },
      zoom: 12,
    },
  );

  const [mapToolsOpen, setMapToolsOpen] = useState<boolean>(false);

  console.log(data);

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
        flatten(data.ministers)
          .filter((minister) => data.selectedMinisterIds.includes(minister.id))
          .map((minister) => minister.family)
          .map((fam) => createMapMarker({ family: fam, color: 'blue' })),
        data.families.map((fam) => createMapMarker({ family: fam })),
      ]);
    }
  }, [data.selectedMinisterIds, map]);

  return (
    <div id="map-page">
      <div id="minister-list">
        {data.ministers.map((letterList) => {
          const letter = letterList[0].family.surname[0];
          return (
            <Fragment key={`${letter}-group`}>
              <div className="minister-list-divider">
                <Divider
                  sx={{
                    flexGrow: 1,
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    position: 'absolute',
                    left: 20,
                    display: 'block',
                    backgroundColor: 'white',
                    width: 30,
                    textAlign: 'center',
                    borderRadius: 15,
                    color: '#999999',
                  }}
                >
                  {letter}
                </Typography>
              </div>
              <List>
                {letterList.map((minister) => {
                  const isActive = data.selectedMinisterIds.includes(
                    minister.id,
                  );
                  const newIdsList = isActive
                    ? data.selectedMinisterIds.filter(
                        (id) => id !== minister.id,
                      )
                    : [...data.selectedMinisterIds, minister.id];

                  return (
                    <ListItemButton
                      key={minister.id}
                      sx={{
                        minHeight: 48,
                      }}
                      selected={isActive}
                      onClick={() =>
                        navigate(
                          `/map${
                            newIdsList.length
                              ? `?ministers=${newIdsList.join('|')}`
                              : ''
                          }`,
                        )
                      }
                    >
                      <ListItemText
                        primary={minister.name}
                        sx={{ opacity: 1, color: '#666666' }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Fragment>
          );
        })}
      </div>
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
            className={`map-controls-content${
              mapToolsOpen ? ' tools-open' : ''
            }`}
          ></div>
        </div>
        <div id="map-content" ref={ref}></div>
      </div>
    </div>
  );
}
