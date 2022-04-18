import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { Fragment, useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useGoogleMaps } from 'react-hook-google-maps';
import stylesUrl from '~/styles/map.css';
import type { Family, Person } from '@prisma/client';
import { db } from '~/architecture/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export interface PersonWithFamimly extends Person {
  family: Family;
}

type LoaderData = {
  ministers: PersonWithFamimly[][];
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

  const ministers = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map((letter) =>
      people.filter(
        (minister) => minister.family.surname.toLowerCase()[0] === letter,
      ),
    )
    .filter((letterList) => letterList.length > 0);

  const families = await db.family.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
  });

  const selectedMinisterIds = ministersTerm ? ministersTerm.split('|') : [];

  return {
    ministers,
    families,
    selectedMinisterIds,
  };
};

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

  if (google) {
    const markers = data.families.map((fam) => {
      const marker = new google.maps.Marker({
        map,
        position: { lat: fam.lat, lng: fam.lng },
      });

      const infowindow = new google.maps.InfoWindow({
        content: `<div class="info-content"><div style="font-weight: bold;">${
          fam.name
        }</div>${fam.address
          .split('\n')
          .map((addressPart) => `<div>${addressPart}</div>`)
          .join('')}</div>${
          fam.active
            ? '<div class="info-status-active">ACTIVE</div>'
            : fam.active === false
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
    });
  }

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
                {letterList.map((minister) => (
                  <ListItemButton
                    key={minister.id}
                    sx={{
                      minHeight: 48,
                    }}
                    selected={data.selectedMinisterIds.includes(minister.id)}
                    onClick={() =>
                      navigate(
                        `/map?ministers=${(data.selectedMinisterIds.includes(
                          minister.id,
                        )
                          ? data.selectedMinisterIds.filter(
                              (id) => id !== minister.id,
                            )
                          : [...data.selectedMinisterIds, minister.id]
                        ).join('|')}`,
                      )
                    }
                  >
                    <ListItemText
                      primary={minister.name}
                      sx={{ opacity: 1, color: '#666666' }}
                    />
                  </ListItemButton>
                ))}
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
