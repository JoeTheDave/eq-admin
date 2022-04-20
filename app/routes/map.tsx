import { useLoaderData } from '@remix-run/react';
import { flatten } from 'lodash';
import dataService from '~/architecture/dataService';
import stylesUrl from '~/styles/map.css';
import MinistersList from '~/components/MinistersList';
import MinisteringMap from '~/components/MinisteringMap';

import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import type { Family } from '@prisma/client';
import type { PersonWithFamily } from '~/architecture/types';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = {
  ministers: PersonWithFamily[][];
  families: Family[];
  selectedMinisterIds: string[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const ministersTerm = url.searchParams.get('ministers');
  const selectedMinisterIds = ministersTerm ? ministersTerm.split('|') : [];

  const ministers = await dataService.getMinistersGrouped();

  const families = selectedMinisterIds.length
    ? await dataService.getRecommendedMinisteringList(selectedMinisterIds)
    : await dataService.getAllFamilies();

  return {
    ministers,
    families,
    selectedMinisterIds,
  };
};

export default function MapRoute() {
  const { ministers, selectedMinisterIds, families } =
    useLoaderData<LoaderData>();

  return (
    <div id="map-page">
      <MinistersList
        ministers={ministers}
        selectedMinisterIds={selectedMinisterIds}
      />
      <MinisteringMap
        ministers={flatten(ministers)}
        selectedMinisterIds={selectedMinisterIds}
        families={families}
      />
    </div>
  );
}
