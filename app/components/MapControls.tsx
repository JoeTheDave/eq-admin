import { useState } from 'react';
import cc from 'classcat';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import useQueryStringNavigator from '~/architecture/hooks/useQueryStringNavigator';

import type { FC } from 'react';

interface MapControlsProps {}

const MapControls: FC<MapControlsProps> = () => {
  const [mapToolsOpen, setMapToolsOpen] = useState<boolean>(false);
  const queryStringNavigator = useQueryStringNavigator();
  const activityTypes = queryStringNavigator.getValues('show');

  return (
    <div id="map-controls">
      <div id="map-controls-button">
        <Button
          color="warning"
          variant="contained"
          onClick={() => setMapToolsOpen(!mapToolsOpen)}
        >
          Tools
        </Button>
      </div>
      <div
        className={cc({
          'map-controls-content': true,
          'tools-open': mapToolsOpen,
        })}
      >
        <CardContent>
          <Typography
            sx={{ fontSize: 16, fontWeight: 'bold' }}
            color="#666"
            gutterBottom
          >
            Show Families of type:
          </Typography>
          <div className="activity-status-list">
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={activityTypes.includes('active')}
                />
              }
              label="Active"
              disabled={
                activityTypes.includes('active') && activityTypes.length === 1
              }
              labelPlacement="start"
              sx={{ color: '#0d0' }}
              onChange={() =>
                queryStringNavigator.toggleValue('show', 'active')
              }
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={activityTypes.includes('unknown')}
                />
              }
              label="Unknown"
              disabled={
                activityTypes.includes('unknown') && activityTypes.length === 1
              }
              labelPlacement="start"
              sx={{ color: '#aaa' }}
              onChange={() =>
                queryStringNavigator.toggleValue('show', 'unknown')
              }
            />
            <FormControlLabel
              control={
                <Switch
                  color="primary"
                  checked={activityTypes.includes('inactive')}
                />
              }
              label="Inactive"
              disabled={
                activityTypes.includes('inactive') && activityTypes.length === 1
              }
              labelPlacement="start"
              sx={{ color: '#f00' }}
              onChange={() =>
                queryStringNavigator.toggleValue('show', 'inactive')
              }
            />
          </div>
        </CardContent>
      </div>
    </div>
  );
};
export default MapControls;
