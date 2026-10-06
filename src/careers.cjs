// Catálogo local: https://www.ucc.mx/licenciaturas/ (consulta: 2026-10-05).
// No se consulta internet durante el uso de la aplicación.
const careerGroups = [
  { area: "Arquitectura, Arte y Diseño", careers: [
    "Arquitectura", "Arquitectura de Interiores y Habitabilidad", "Diseño Gráfico y Producción Digital",
  ] },
  { area: "Business School", careers: [
    "Administración y Dirección de Empresas", "Contaduría y Finanzas", "Economía", "Mercados y Negocios Internacionales",
  ] },
  { area: "Ciencia y Tecnología", careers: [
    "Actuaría", "Ciencia de Datos e Inteligencia de Negocios", "Ingeniería en Mecatrónica",
    "Ingeniería en Sistemas Computacionales", "Ingeniería Industrial", "Ingeniería Petrolera",
  ] },
  { area: "Ciencias de la Salud", careers: ["Médico Cirujano", "Nutrición y Ciencia de los Alimentos"] },
  { area: "Humanidades", careers: [
    "Ciencias de la Educación", "Comunicación y Entornos Digitales", "Derecho", "Idiomas", "Psicología", "Publicidad y Mercadotecnia Digital",
  ] },
];
const normalizeSearch = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
function searchCareers(query) {
  const term = normalizeSearch(query);
  return careerGroups.map(group => ({ ...group, careers: group.careers.filter(career => normalizeSearch(career).includes(term) || normalizeSearch(group.area).includes(term)) })).filter(group => group.careers.length);
}
module.exports = { careerGroups, searchCareers };
