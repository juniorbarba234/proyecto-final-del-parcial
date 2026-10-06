const { test } = require("node:test");
const assert = require("node:assert/strict");
const { vehicleFields, validateStudent, demoState, move } = require("../src/domain.cjs");
test("Compatibilidad con vehículos antiguos sin inventar colores", () => {
  assert.deepEqual(vehicleFields({ vehicle: "Nissan Versa · Blanco" }), { model: "Nissan Versa", color: "Blanco" });
  assert.deepEqual(vehicleFields({ vehicle: "Toyota azul" }), { model: "Toyota azul", color: "" });
});
test("Guarda campos separados y exige modelo y color", () => {
  const original = demoState().students[0];
  const s = validateStudent({ ...original, model: " Toyota Yaris ", color: " Rojo " }, []);
  assert.equal(s.model, "Toyota Yaris");
  assert.equal(s.color, "Rojo");
  assert.equal(s.vehicle, "Toyota Yaris · Rojo");
  for (const field of ["model", "color"]) assert.throws(() => validateStudent({ ...s, [field]: "" }, []), /modelo y el color/);
});
test("Historial conserva modelo y color de la entrada", () => {
  const state = demoState();
  state.students[0] = validateStudent({ ...state.students[0], model: "Toyota Yaris", color: "Rojo" }, []);
  const next = move(state, "20260001", "entry");
  next.students[0].color = "Azul";
  assert.equal(next.visits[0].color, "Rojo");
  assert.equal(next.visits[0].model, "Toyota Yaris");
});
