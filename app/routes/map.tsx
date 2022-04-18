import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { Fragment, useState } from 'react';
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
import { db } from '~/architecture/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = { families: Family[][] };

export const loader: LoaderFunction = async (/* { request } */) => {
  // const url = new URL(request.url);
  // const term = url.searchParams.get('test');

  const data = await db.family.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
  });
  const families = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map((letter) => data.filter((fam) => fam.name[0].toLowerCase() == letter))
    .filter((letterList) => letterList.length > 0);
  return {
    families,
  };
};

export default function MapRoute() {
  const data = useLoaderData<LoaderData>();

  const { ref, map, google } = useGoogleMaps(
    'AIzaSyC-d1WM72-74auAY0USczfUb68ZAgbjxec',
    {
      center: { lat: 39.0628883, lng: -94.6942146 },
      zoom: 12,
    },
  );

  const [mapToolsOpen, setMapToolsOpen] = useState<boolean>(false);

  if (google) {
    const allFams = flatten(data.families);
    console.log(allFams);

    const markers = allFams.map((fam) => {
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
      <div id="member-list">
        {data.families.map((letterList) => {
          const letter = letterList[0].name[0];
          return (
            <Fragment key={`${letter}-group`}>
              <div className="member-list-divider">
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
                {letterList.map((family) => (
                  <ListItemButton
                    key={family.id}
                    sx={{
                      minHeight: 48,
                    }}
                  >
                    <ListItemText
                      primary={family.name}
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
