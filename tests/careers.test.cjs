const { test } = require("node:test");
const assert = require("node:assert/strict");
const { careerGroups, searchCareers } = require("../src/careers.cjs");
test("Catálogo UCC: 21 licenciaturas únicas en cinco áreas", () => {
  const careers = careerGroups.flatMap(group => group.careers);
  assert.equal(careerGroups.length, 5);
  assert.equal(careers.length, 21);
  assert.equal(new Set(careers).size, 21);
  assert.ok(careers.includes("Ingeniería en Sistemas Computacionales"));
});
test("Busca sin acentos, por carrera o por área", () => {
  assert.equal(searchCareers("  ACTUARIA ")[0].careers[0], "Actuaría");
  assert.equal(searchCareers("salud")[0].careers.length, 2);
  assert.equal(searchCareers("").flatMap(g => g.careers).length, 21);
  assert.deepEqual(searchCareers("xxxxxxxxx"), []);
});
