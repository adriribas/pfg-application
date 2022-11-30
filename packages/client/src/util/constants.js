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
const workingDaysShort = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv'];
const groupTypeLabels = {
  big: 'Gran',
  medium: 'Mitjà',
  small: 'Petit',
  generic: 'Genèric'
};
const scheduleIntervalStart = 7.5;
const scheduleIntervalStartTime = '07:30';
const scheduleIntervalEnd = 20.5;
const scheduleIntervalEndTime = '20:30';
const scheduleIntervalMinutes = 30;
const scheduleIntervalHeight = 40;
const scheduleDurationMin = 15;
const scheduleIntervalMargin = 1;
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
  resizer: 5,
  detailTime: 4,
  detailSubject: 4,
  detailGroupBg: 5,
  detailDept: 1,
  detailDeptBg: 6,
  modTimePicker: 7,
  modTimePickerClose: 8,
  headerIcons: 12,
  week: 11,
  data: 1,
  captions: 2,
  okBtn: 8,
  successNotif: 9
};
const timeBlockFontSizes = {
  subject: 9,
  group: 8.5,
  unplacedGroup: 9,
  week: 8,
  detailTime: 12,
  detailSubject: 12,
  detailGroup: 11,
  week: 10
};
const timeBlocksSizeLevels = [2499, 10749];
const timeBlockShakeAnimation = 'rubberBand';
const draggingCursor = 'cursor-grabbing';

export default () => ({
  roleMapping,
  courseLabels,
  semesterLabels,
  weekDays,
  workingDaysShort,
  groupTypeLabels,
  scheduleIntervalStart,
  scheduleIntervalStartTime,
  scheduleIntervalEnd,
  scheduleIntervalEndTime,
  scheduleIntervalMinutes,
  scheduleIntervalHeight,
  scheduleDurationMin,
  scheduleIntervalMargin,
  timeBlockColorNames,
  timeBlockColorTones,
  timeBlockFontSizes,
  timeBlocksSizeLevels,
  timeBlockShakeAnimation,
  draggingCursor
});
