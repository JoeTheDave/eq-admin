import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import * as _ from 'lodash';

const db = new PrismaClient();

interface FamilyData {
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  uuid: string;
  members: {
    displayName: string;
    uuid: string;
    positions?: {
      positionTypeName: string;
    }[];
  }[];
}

var familyData: FamilyData[] = JSON.parse(
  fs.readFileSync(`${__dirname}/data.json`, 'utf8'),
).filter((fam: FamilyData) => !!fam.coordinates);

(async () => {
  const families = await Promise.all(
    familyData.map(async (family) => {
      return await db.family.create({
        data: {
          name: family.name,
          address: family.address,
          lat: family.coordinates?.latitude || 0,
          lng: family.coordinates?.longitude || 0,
          churchId: family.uuid,
          persons: {
            create: family.members.map((member) => ({
              name: member.displayName,
              chruchId: member.uuid,
              calling: (member.positions || [])
                .map((pos) => pos.positionTypeName)
                .join('|'),
            })),
          },
        },
      });
    }),
  );

  const distances = _.flattenDeep(
    families.map((fam1) =>
      families.map((fam2) => ({
        fam1,
        fam2,
        distance: Math.sqrt(
          Math.pow(fam2.lat - fam1.lat, 2) + Math.pow(fam2.lng - fam1.lng, 2),
        ),
      })),
    ),
  ).filter(
    (res) => res.distance !== 0 && res.fam1.address !== res.fam2.address,
  );

  await db.distance.createMany({
    data: distances.map((dist) => ({
      sourceFamilyId: dist.fam1.id,
      destinationFamilyId: dist.fam2.id,
      distance: dist.distance,
    })),
  });
})();
