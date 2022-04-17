import { Fragment } from 'react';
import type {
  LinksFunction,
  LoaderFunction,
  ActionFunction,
} from '@remix-run/server-runtime';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import Typography from '@mui/material/Typography';

import stylesUrl from '~/styles/families.css';
import type { Family } from '@prisma/client';
import { db } from '~/architecture/db.server';

import FamilyCard from '~/components/familyCard';

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

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();

  const id: string = form.get('id')?.toString() || '';
  const value: string = form.get('value')?.toString() || '';

  console.log(id, value);

  if (id && value) {
    const result = await db.family.update({
      where: {
        id,
      },
      data: {
        active: value === 'true',
      },
    });
    console.log(result);
  } else {
    throw new Error('oops');
  }

  return json({
    value: form.get('value'),
  });
};

export default function FamiliesRoute() {
  const data = useLoaderData<LoaderData>();
  return (
    <div id="families-page">
      {data.families.map((grouping, idx) => {
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
