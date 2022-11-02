const roleMapping = {
  Administrador: 'administrador',
  Coordinador: 'coordinador',
  'Director de departament': 'director',
  'Responsable de docencia': 'responsable',
  Professor: 'professor'
};
const courseLabels = ['Primer', 'Segon', 'Tercer', 'Quart', 'Cinquè', 'Sisè', 'Setè', 'Vuitè'];
const semesterLabels = ['1r', '2n'];

export default () => ({
  roleMapping,
  courseLabels,
  semesterLabels
});
