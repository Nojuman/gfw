import { createSelector } from 'reselect';
import compact from 'lodash/compact';

// get list data
const getSettings = state => state.settings || null;
const getType = state => state.type || null;

// get lists selected
export const getStatement = createSelector(
  [getSettings, getType],
  (settings, type) => {
    if (!settings) return '';
    const { extentYear, threshold } = settings;
    const statements = compact([
      extentYear ? `${extentYear} tree cover extent` : null,
      threshold || threshold === 0 ? `>${threshold}% tree canopy` : null,
      type === 'loss'
        ? 'these estimates do not take tree cover gain into account'
        : null
    ]);

    return statements.join(' | ');
  }
);
