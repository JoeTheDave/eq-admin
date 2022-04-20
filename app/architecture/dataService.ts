import { db } from '~/architecture/db.server';

import type { Family } from '@prisma/client';
import type { PersonWithFamily, FamilyWithMembers } from '~/architecture/types';

const letters = 'abcdefghijklmnopqrstuvwxyz';

export const getAllFamilies = async () => {
  return (await db.family.findMany({
    orderBy: [
      {
        name: 'asc',
      },
    ],
    include: {
      persons: true,
    },
  })) as FamilyWithMembers[];
};

export const getFamiliesGrouped = async () => {
  const families = await getAllFamilies();
  return letters
    .split('')
    .map((letter) =>
      families.filter((family) => family.name[0].toLowerCase() === letter),
    )
    .filter((letterList) => letterList.length > 0) as FamilyWithMembers[][];
};

export const getMinisters = async () => {
  return (await db.person.findMany({
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
  })) as PersonWithFamily[];
};

export const getMinistersGrouped = async () => {
  const ministers = await getMinisters();

  return letters
    .split('')
    .map((letter) =>
      ministers.filter(
        (minister) => minister.family.surname.toLowerCase()[0] === letter,
      ),
    )
    .filter((letterList) => letterList.length > 0) as PersonWithFamily[][];
};

export const getRecommendedMinisteringList = async (ministerIds: string[]) => {
  const ministers = await getMinisters();

  const selectedMinisterFamilies = ministerIds.map(
    (ministerId) =>
      (ministers.find((m) => m.id === ministerId) as PersonWithFamily).family,
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

  return (await db.$queryRawUnsafe(query)) as Family[];
};

export default {
  getAllFamilies,
  getFamiliesGrouped,
  getMinisters,
  getMinistersGrouped,
  getRecommendedMinisteringList,
};
