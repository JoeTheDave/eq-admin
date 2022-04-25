import MinistersListGroup from '~/components/MinistersListGroup';

import type { FC } from 'react';
import type { PersonWithFamily } from '~/architecture/types';

interface MinistersListProps {
  ministers: PersonWithFamily[][];
}

const MinistersList: FC<MinistersListProps> = ({ ministers }) => (
  <div id="minister-list">
    {ministers.map((ministerGroup) => {
      const letter = ministerGroup[0].family.surname[0];
      return (
        <MinistersListGroup
          key={`minister-gorup-${letter}`}
          groupLetter={letter}
          ministers={ministerGroup}
        />
      );
    })}
  </div>
);
export default MinistersList;
