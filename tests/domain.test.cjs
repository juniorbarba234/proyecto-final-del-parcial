const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  demoState,
  readCode,
  validateStudent,
  inspect,
  move,
  duration,
  validState,
  validDate,
  credentialValidity,
  applyCommonValidity,
} = require("../src/domain.cjs");
test("Lee QR de prueba y matrícula manual", () => {
  assert.equal(readCode("ACCESOUNI:20260001"), "20260001");
  assert.equal(readCode(" 20260001 "), "20260001");
  assert.throws(() => readCode("https://sitio.com"));
  assert.throws(() => readCode(""));
});
test("Registra semestre y vigencia sin alterar los datos de la credencial", () => {
  const s = demoState();
  const student = validateStudent(s.students[0], s.students, s.students[0].id);
  assert.equal(student.semester, "7");
  assert.equal(credentialValidity(student), "01/09/2026 al 31/08/2027");
  for (const semester of ["", "0", "11", "16", "17", "2.5", "texto"])
    assert.throws(() => validateStudent({ ...student, semester }, [], null), /semestre/);
  assert.equal(validateStudent({ ...student, validUntil: "2026-08-01" }, [], null).validUntil, "2027-08-31");
  assert.equal(validateStudent({ ...student, validFrom: "" }, [], null).validFrom, "2026-09-01");
});
test("Unifica vigencia de registros anteriores sin alterar alumnos ni historial", () => {
  const original = demoState();
  original.students[0].validUntil = "2025-01-01";
  const updated = applyCommonValidity(original);
  assert.equal(updated.students[0].validUntil, "2027-08-31");
  assert.equal(updated.students[0].name, original.students[0].name);
  assert.equal(updated.visits, original.visits);
  assert.equal(original.students[0].validUntil, "2025-01-01");
  assert.equal(applyCommonValidity(updated), updated);
});
test("Fechas reales y registros anteriores sin nuevos campos", () => {
  assert.equal(validDate("2028-02-29"), true);
  assert.equal(validDate("2026-02-29"), false);
  assert.equal(credentialValidity({}), "No registrada");
  const s = demoState();
  for (const student of s.students) {
    delete student.semester; delete student.validFrom; delete student.validUntil; delete student.photo;
  }
  assert.equal(validState(s), true);
  assert.doesNotThrow(() => inspect(s, "20260001", "entry"));
});
test("La fotografía es local y no acepta direcciones remotas", () => {
  const student = demoState().students[0];
  assert.throws(() => validateStudent({ ...student, photo: "https://example.com/foto.jpg" }, [], null), /fotografía/);
  assert.throws(() => validateStudent({ ...student, photo: "data:image/jpeg;base64," + "A".repeat(1500000) }, [], null), /grande/);
});
test("Entrada y salida conservan historial y calculan duración", () => {
  const s = move(demoState(), "20260001", "entry", "2026-10-05T14:00:00Z");
  assert.equal(s.visits.length, 1);
  const out = move(s, "20260001", "exit", "2026-10-05T15:32:00Z");
  assert.equal(duration(out.visits[0].in, out.visits[0].out), "1 h 32 min");
  assert.equal(out.visits.filter((x) => !x.out).length, 0);
  assert.equal(s.visits[0].out, null);
});
test("Rechaza alumno desconocido e inactivo", () => {
  assert.throws(
    () => inspect(demoState(), "99999999", "entry"),
    /no registrada/,
  );
  assert.throws(
    () => inspect(demoState(), "20260003", "entry"),
    /deshabilitado/,
  );
});
test("Rechaza entradas duplicadas y salida sin entrada", () => {
  const s = move(demoState(), "20260001", "entry");
  assert.throws(() => move(s, "20260001", "entry"), /abierta/);
  assert.throws(() => move(demoState(), "20260001", "exit"), /No hay/);
});
test("Aforo completo bloquea entrada y permite salida", () => {
  const s = move({ ...demoState(), capacity: 1 }, "20260001", "entry");
  assert.throws(() => move(s, "20260002", "entry"), /lleno/);
  assert.doesNotThrow(() => move(s, "20260001", "exit"));
});
test("Alumno deshabilitado con vehículo dentro puede salir", () => {
  const s = move(demoState(), "20260001", "entry");
  s.students[0].active = false;
  assert.doesNotThrow(() => move(s, "20260001", "exit"));
});
test("Valida campos, matrícula y placas duplicadas", () => {
  const s = demoState();
  assert.throws(() => validateStudent(s.students[0], s.students), /matrícula/);
  assert.throws(
    () => validateStudent({ ...s.students[0], id: "20260009" }, s.students),
    /placas/,
  );
  assert.throws(
    () =>
      validateStudent(
        { ...s.students[0], name: "" },
        s.students,
        s.students[0].id,
      ),
    /campos/,
  );
  assert.doesNotThrow(() =>
    validateStudent(s.students[0], s.students, s.students[0].id),
  );
});
test("Archivo local válido y esquema corrupto", () => {
  assert.equal(validState(demoState()), true);
  assert.equal(validState({ ...demoState(), capacity: 0 }), false);
  assert.equal(validState({ ...demoState(), visits: [{}] }), false);
});
test("Historial conserva nombre y placa aunque cambie el padrón", () => {
  const s = move(demoState(), "20260001", "entry");
  s.students[0].name = "Otro nombre";
  assert.equal(s.visits[0].name, "Ana Torres");
});
test("Un nuevo acceso después de salir genera una visita nueva", () => {
  let s = move(demoState(), "20260001", "entry", "2026-10-05T10:00:00Z");
  s = move(s, "20260001", "exit", "2026-10-05T11:00:00Z");
  s = move(s, "20260001", "entry", "2026-10-05T12:00:00Z");
  assert.equal(s.visits.length, 2);
  assert.equal(s.visits.filter((v) => !v.out).length, 1);
});
