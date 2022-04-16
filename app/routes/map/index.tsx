import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { Fragment } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { useGoogleMaps } from 'react-hook-google-maps';
import { flatten } from 'lodash';
import stylesUrl from '~/styles/map.css';
import type { Family } from '@prisma/client';
import { db } from '~/architecture/db.server';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = { families: Family[][] };

export const loader: LoaderFunction = async () => {
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

export default function MapIndexRoute() {
  const data = useLoaderData<LoaderData>();

  const { ref, map, google } = useGoogleMaps(
    'AIzaSyC-d1WM72-74auAY0USczfUb68ZAgbjxec',
    {
      center: { lat: 39.0628883, lng: -94.6942146 },
      zoom: 12,
    },
  );

  if (google) {
    const allFams = flatten(data.families);
    console.log(allFams);

    const markers = allFams.map(
      (fam) =>
        new google.maps.Marker({
          map,
          position: { lat: fam.lat, lng: fam.lng },
          title: fam.name,
        }),
    );

    // marker.setMap(map);
  }

  // useEffect(() => {
  //   setTimeout(async () => {
  //     const options: LoaderOptions = {
  //       /* todo */
  //     };
  //     const loader = new Loader(
  //       'AIzaSyC-d1WM72-74auAY0USczfUb68ZAgbjxec',
  //       options,
  //     );

  //     const google = await loader.load();
  //     const map = new google.maps.Map(
  //       document.getElementById('map-container') as HTMLElement,
  //       {
  //         center: { lat: 39.0628883, lng: -94.6942146 },
  //         zoom: 12,
  //       },
  //     );
  //   }, 1000);
  // }, []);

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
      <div id="map-container" ref={ref}></div>
    </div>
  );
}
