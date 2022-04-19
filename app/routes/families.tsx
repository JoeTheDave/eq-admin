import { Fragment } from 'react';
import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import Typography from '@mui/material/Typography';
import stylesUrl from '~/styles/families.css';
import { db } from '~/architecture/db.server';
import FamilyCard from '~/components/FamilyCard';

import type { FamilyWithMembers } from '~/types/FamilyWithMembers';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

type LoaderData = { families: FamilyWithMembers[][] };

export const loader: LoaderFunction = async () => {
  const data = await db.family.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
    include: {
      persons: true,
    },
  });
  const families = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map((letter) => data.filter((fam) => fam.name[0].toLowerCase() == letter))
    .filter((letterList) => letterList.length > 0);
  return {
    families,
  };
};

export default function FamiliesRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div id="families-page">
      {data.families.map((grouping) => {
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
