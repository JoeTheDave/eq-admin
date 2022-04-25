import { Fragment } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useQueryStringNavigator from '~/architecture/hooks/useQueryStringNavigator';

import type { FC } from 'react';
import type { PersonWithFamily } from '~/architecture/types';

interface MinistersListGroupProps {
  groupLetter: string;
  ministers: PersonWithFamily[];
}

const MinistersListGroup: FC<MinistersListGroupProps> = ({
  groupLetter,
  ministers,
}) => {
  const queryStringNavigator = useQueryStringNavigator();
  const selectedMinisterIds = queryStringNavigator.getValues('ministers');

  return (
    <Fragment key={`${groupLetter}-group`}>
      <div className="minister-list-divider">
        <Divider
          sx={{
            flexGrow: 1,
          }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{
            position: 'absolute',
            left: 20,
            display: 'block',
            backgroundColor: 'white',
            width: 30,
            textAlign: 'center',
            borderRadius: 15,
            color: '#999999',
          }}
        >
          {groupLetter}
        </Typography>
      </div>
      <List>
        {ministers.map((minister) => {
          const isActive = selectedMinisterIds.includes(minister.id);

          return (
            <ListItemButton
              key={minister.id}
              sx={{
                minHeight: 48,
              }}
              selected={isActive}
              onClick={() =>
                queryStringNavigator.toggleValue('ministers', minister.id)
              }
            >
              <ListItemText
                primary={minister.name}
                sx={{ opacity: 1, color: '#666666' }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Fragment>
  );
};

export default MinistersListGroup;
