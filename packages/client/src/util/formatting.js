import { date } from 'quasar';

const { formatDate } = date;

const timeTranslations = {
  days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
  daysShort: ['Dg.', 'Dl.', 'Dt.', 'Dc.', 'Dj.', 'Dv', 'Ds'],
  months: [
    'de gener',
    'de febrer',
    'de març',
    "d'abril",
    'de maig',
    'de juny',
    'de juliol',
    "d'agost",
    'de setembre',
    "d'octubre",
    'de novembre',
    'de desembre'
  ],
  monthsShort: ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS']
};

const toFullLongDate = date => formatDate(date, 'dddd MMMM [de] YYYY', timeTranslations);

const toLongDate = date => formatDate(date, 'D MMMM [de] YYYY', timeTranslations);

export default () => ({
  toFullLongDate,
  toLongDate
});
