const { test } = require("node:test");
const assert = require("node:assert/strict");
const { semesters, semesterLabel } = require("../src/semesters.cjs");
const { demoState, validateStudent } = require("../src/domain.cjs");
test("Diez semestres con nombre y valor compatible con registros previos", () => {
  assert.equal(semesters.length, 10);
  assert.equal(semesterLabel("1"), "Primer semestre");
  assert.equal(semesterLabel(10), "Décimo semestre");
  assert.equal(semesterLabel("7"), "Séptimo semestre");
  assert.equal(semesterLabel(undefined), "Semestre no registrado");
  assert.match(semesterLabel("16"), /actualizar/);
  for (const { value } of semesters) {
    const s = validateStudent({ ...demoState().students[0], semester: value }, []);
    assert.equal(s.semester, value);
  }
});
