import instruments from './equipment/data/instruments.json';
import effects from './equipment/data/effects.json';
import amplifiers from './equipment/data/amplifiers.json';

export default {
  instruments: {
    equipmentType: 'instruments',
    items: instruments,
    name: {
      en: 'Instruments',
      no: 'Instrumenter'
    }
  },
  effects: {
    equipmentType: 'effects',
    items: effects,
    name: {
      en: 'Effects',
      no: 'Effekter'
    }
  },
  amplifiers: {
    equipmentType: 'amplifiers',
    items: amplifiers,
    name: {
      en: 'Amplifiers',
      no: 'Forsterkere'
    }
  }
}
