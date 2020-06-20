import instrumentItems from './equipment/data/instruments.json';
import effectItems from './equipment/data/effects.json';
import amplifierItems from './equipment/data/amplifiers.json';

export const instruments = {
  equipmentType: 'instruments',
  items: instrumentItems,
  name: {
    en: 'Instruments',
    no: 'Instrumenter'
  }
};

export default {
  instruments: {
    equipmentType: 'instruments',
    items: instrumentItems,
    name: {
      en: 'Instruments',
      no: 'Instrumenter'
    }
  },
  effects: {
    equipmentType: 'effects',
    items: effectItems,
    name: {
      en: 'Effects',
      no: 'Effekter'
    }
  },
  amplifiers: {
    equipmentType: 'amplifiers',
    items: amplifierItems,
    name: {
      en: 'Amplifiers',
      no: 'Forsterkere'
    }
  }
}
