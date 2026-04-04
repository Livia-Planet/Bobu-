import { gachaPool } from './constants';
import { TileSkin } from './types';

export const getHighestUnlockedForm = (planetValue: number | string, gachaCollection: string[]): number => {
  const skinsForPlanet = gachaPool.filter(
    item => item.type === 'TileSkin' && (item as TileSkin).value === planetValue
  ) as TileSkin[];

  let highestForm = 1;
  for (const skin of skinsForPlanet) {
    if (gachaCollection.includes(skin.id) && skin.form > highestForm) {
      highestForm = skin.form;
    }
  }

  return highestForm;
};
