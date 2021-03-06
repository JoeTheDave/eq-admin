import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import LoadingButton from '@mui/lab/LoadingButton';
import { useFetcher } from '@remix-run/react';
import PersonRow from '~/components/PersonRow';

import type { FC } from 'react';
import type { FamilyWithMembers } from '~/architecture/types';

interface FamilyCardProps {
  family: FamilyWithMembers;
}

const FamilyCard: FC<FamilyCardProps> = ({ family }) => {
  const fetcher = useFetcher();
  return (
    <Card
      sx={{
        minWidth: 400,
        margin: 2,
        position: 'relative',
        transition: '0.5s',
        backgroundColor: family.active
          ? '#EFE'
          : family.active === false
          ? '#FEE'
          : '#FFF',
      }}
    >
      <CardContent>
        <Typography
          sx={{
            fontSize: 16,
            position: 'absolute',
            top: 10,
            right: 15,
          }}
          color={family.active ? '#0D0' : '#F00'}
          gutterBottom
        >
          {family.active ? 'ACTIVE' : family.active === false ? 'INACTIVE' : ''}
        </Typography>
        <Typography
          sx={{ fontSize: 22, fontWeight: 'bold' }}
          color="#777"
          gutterBottom
        >
          {family.name.split(', ')[0]}
        </Typography>
        <Typography sx={{ fontSize: 18 }} color="#888" gutterBottom>
          {family.name.split(', ')[1]}
        </Typography>
        <div className="family-members-container">
          {family.persons
            .sort((a, b) => (a.familyOrder > b.familyOrder ? 1 : -1))
            .map((person) => (
              <PersonRow
                key={`member-${person.id}`}
                person={person}
                family={family}
              />
            ))}
        </div>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        {family.active !== false && (
          <LoadingButton
            variant="outlined"
            color="error"
            size="small"
            onClick={() =>
              fetcher.submit(
                { id: family.id, value: 'false' },
                { method: 'post', action: '/api/set-family-activity' },
              )
            }
            loading={fetcher.state !== 'idle'}
          >
            Set Inactive
          </LoadingButton>
        )}

        {family.active !== true && (
          <LoadingButton
            variant="outlined"
            color="success"
            size="small"
            onClick={() =>
              fetcher.submit(
                { id: family.id, value: 'true' },
                { method: 'post', action: '/api/set-family-activity' },
              )
            }
            loading={fetcher.state !== 'idle'}
          >
            Set Active
          </LoadingButton>
        )}
      </CardActions>
    </Card>
  );
};

export default FamilyCard;
