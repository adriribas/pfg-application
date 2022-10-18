import { date } from 'quasar';

const { formatDate } = date;

const timeTranslations = {
  days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
  daysShort: ['Dg.', 'Dl.', 'Dt.', 'Dc.', 'Dj.', 'Dv', 'Ds'],
  months: [
    'gener',
    'febrer',
    'març',
    "d'abril",
    'maig',
    'juny',
    'juliol',
    "d'agost",
    'setembre',
    "d'octubre",
    'novembre',
    'desembre'
  ],
  monthsShort: ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS']
};

const toFullLongDate = date => formatDate(date, 'dddd MMMM [de] YYYY', timeTranslations);

const toLongDate = date => formatDate(date, 'D MMMM [de] YYYY', timeTranslations);

export default () => ({
  toFullLongDate,
  toLongDate
});
