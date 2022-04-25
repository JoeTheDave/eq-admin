import { useLoaderData } from '@remix-run/react';
import { useEffect } from 'react';
import { flatten } from 'lodash';
import dataService from '~/architecture/dataService';
import queryStringService from '~/architecture/queryStringService';
import useQueryStringNavigator from '~/architecture/hooks/useQueryStringNavigator';
import stylesUrl from '~/styles/map.css';
import MinistersList from '~/components/MinistersList';
import MinisteringMap from '~/components/MinisteringMap';

import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import type { Family } from '@prisma/client';
import type { PersonWithFamily, ActivityType } from '~/architecture/types';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = {
  ministers: PersonWithFamily[][];
  families: Family[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const queryString = queryStringService(request);
  const selectedMinisterIds = queryString.getValues('ministers');
  const activityTypes = queryString.getValues('show') as ActivityType[];
  const ministers = await dataService.getMinistersGrouped();

  const families = selectedMinisterIds.length
    ? await dataService.getRecommendedMinisteringList(
        selectedMinisterIds,
        activityTypes,
      )
    : await dataService.getAllFamilies(activityTypes);

  return {
    ministers,
    families,
  };
};

export default function MapRoute() {
  const { ministers, families } = useLoaderData<LoaderData>();
  const queryStringNavigator = useQueryStringNavigator();

  useEffect(() => {
    if (!queryStringNavigator.getValue('show')) {
      queryStringNavigator.toggleValue('show', 'active');
    }
  }, []);

  return (
    <div id="map-page">
      <MinistersList ministers={ministers} />
      <MinisteringMap ministers={flatten(ministers)} families={families} />
    </div>
  );
}
