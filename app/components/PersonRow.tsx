import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import { useFetcher } from '@remix-run/react';

import type { FC } from 'react';
import type { Person, Family } from '@prisma/client';

interface PersonRowProps {
  person: Person;
  family: Family;
}

const PersonRow: FC<PersonRowProps> = ({ person, family }) => {
  const fetcher = useFetcher();
  return (
    <div className="person-row">
      <div className="person-row-info">
        <Typography sx={{ fontSize: 12 }} color="#333">
          {`${person.name.replace(family.name.split(', ')[0], '')}`}
        </Typography>
        <Typography
          sx={{
            fontSize: 12,
            paddingLeft: 1,
            width: 300,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
          color="#999"
        >
          {person.calling || ' '}
        </Typography>
      </div>
      <div className="person-row-action">
        <Switch
          checked={person.isMinister}
          disabled={fetcher.state !== 'idle'}
          onClick={() =>
            fetcher.submit(
              { id: person.id, value: `${!person.isMinister}` },
              { method: 'post', action: '/api/set-minister-status' },
            )
          }
        />
      </div>
    </div>
  );
};

export default PersonRow;
