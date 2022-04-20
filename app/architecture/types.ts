import type { Family, Person } from '@prisma/client';

export interface FamilyWithMembers extends Family {
  persons: Person[];
}

export interface PersonWithFamily extends Person {
  family: Family;
}
