import type { Family, Person } from '@prisma/client';

export interface PersonWithFamily extends Person {
  family: Family;
}
