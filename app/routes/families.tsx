import { Fragment } from 'react';
import { useLoaderData } from '@remix-run/react';
import Typography from '@mui/material/Typography';
import stylesUrl from '~/styles/families.css';
import FamilyCard from '~/components/FamilyCard';
import dataService from '~/architecture/dataService';

import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import type { FamilyWithMembers } from '~/architecture/types';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = { families: FamilyWithMembers[][] };

export const loader: LoaderFunction = async () => {
  const families = await dataService.getFamiliesGrouped();

  return {
    families,
  };
};

export default function FamiliesRoute() {
  const { families } = useLoaderData<LoaderData>();
  return (
    <div id="families-page">
      {families.map((grouping) => {
        const letter = grouping[0].name[0];
        return (
          <Fragment key={`${letter}-group`}>
            <div className="grouping-header">
              <Typography
                sx={{ fontSize: 32, fontWeight: 'bold' }}
                color="#777"
                gutterBottom
              >
                {letter}
              </Typography>
            </div>
            <div className="letter-grouping">
              {grouping.map((fam) => (
                <FamilyCard key={fam.id} family={fam} />
              ))}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
