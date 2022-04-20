import MinistersListGroup from '~/components/MinistersListGroup';

import type { FC } from 'react';
import type { PersonWithFamily } from '~/architecture/types';

interface MinistersListProps {
  ministers: PersonWithFamily[][];
  selectedMinisterIds: string[];
}

const MinistersList: FC<MinistersListProps> = ({
  ministers,
  selectedMinisterIds,
}) => (
  <div id="minister-list">
    {ministers.map((ministerGroup) => {
      const letter = ministerGroup[0].family.surname[0];
      return (
        <MinistersListGroup
          key={`minister-gorup-${letter}`}
          groupLetter={letter}
          ministers={ministerGroup}
          selectedMinisterIds={selectedMinisterIds}
        />
      );
    })}
  </div>
);
export default MinistersList;
