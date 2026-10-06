const semesters = [
  "Primer semestre", "Segundo semestre", "Tercer semestre", "Cuarto semestre",
  "Quinto semestre", "Sexto semestre", "Séptimo semestre", "Octavo semestre",
  "Noveno semestre", "Décimo semestre",
].map((label, index) => ({ value: String(index + 1), label }));
function semesterLabel(value) {
  return semesters.find(item => item.value === String(value))?.label || (value ? `Semestre ${value} (actualizar registro)` : "Semestre no registrado");
}
module.exports = { semesters, semesterLabel };
