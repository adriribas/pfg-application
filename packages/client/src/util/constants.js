const roleMapping = {
  Administrador: 'administrador',
  Coordinador: 'coordinador',
  'Director de departament': 'director',
  'Responsable de docencia': 'responsable',
  Professor: 'professor'
};
const courseLabels = ['Primer', 'Segon', 'Tercer', 'Quart', 'Cinquè', 'Sisè', 'Setè', 'Vuitè'];
const semesterLabels = ['1r', '2n'];
const weekDays = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
const groupTypeLabels = {
  big: 'Gran',
  medium: 'Mitjà',
  small: 'Petit',
  generic: 'Genèric'
};
const scheduleIntervalStart = 7.5;
const scheduleIntervalStartTime = '07:30';
const scheduleIntervalEnd = 21.5;
const scheduleIntervalEndTime = '21:30';
const scheduleIntervalMinutes = 30;
const scheduleIntervalHeight = 40;
const timeBlockColorNames = {
  big: 'orange',
  medium: 'green',
  small: 'indigo',
  generic: 'red'
};
const timeBlockColorTones = {
  bg: 7,
  weekBg: 5,
  tooltipBg: 9,
  detailHeaderIcons: 12,
  detailTime: 4,
  detailSubject: 4,
  detailGroupBg: 5,
  detailWeek: 11,
  detailData: 3,
  detailDept: 2,
  detailDeptBg: 6,
  detailCloseBtn: 8,
  resizer: 5
};
const timeBlockFontSizes = {
  subject: 9,
  group: 8.5,
  unplacedGroup: 9,
  week: 8,
  detailTime: 12,
  detailSubject: 12,
  detailGroup: 11,
  detailWeek: 10
};
const timeBlocksSizeLevels = [2499, 10749];
const timeBlockShakeAnimation = 'rubberBand';
const draggingCursor = 'cursor-grabbing';

export default () => ({
  roleMapping,
  courseLabels,
  semesterLabels,
  weekDays,
  groupTypeLabels,
  scheduleIntervalStart,
  scheduleIntervalStartTime,
  scheduleIntervalEnd,
  scheduleIntervalEndTime,
  scheduleIntervalMinutes,
  scheduleIntervalHeight,
  timeBlockColorNames,
  timeBlockColorTones,
  timeBlockFontSizes,
  timeBlocksSizeLevels,
  timeBlockShakeAnimation,
  draggingCursor
});
