import type { ActionFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/node';
import { db } from '~/architecture/db.server';

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const id: string = form.get('id')?.toString() || '';
  const value: string = form.get('value')?.toString() || '';

  if (id && value) {
    await db.person.update({
      where: {
        id,
      },
      data: {
        isMinister: value === 'true',
      },
    });
  } else {
    throw new Error('oops');
  }

  return json({
    value: form.get('value'),
  });
};
