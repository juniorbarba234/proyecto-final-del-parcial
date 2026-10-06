const COMMON_VALIDITY = Object.freeze({ validFrom: "2026-09-01", validUntil: "2027-08-31" });
function applyCommonValidity(state) {
  if (state.students.every(s => s.validFrom === COMMON_VALIDITY.validFrom && s.validUntil === COMMON_VALIDITY.validUntil)) return state;
  return { ...state, students: state.students.map(s => ({ ...s, ...COMMON_VALIDITY })) };
}
const normalize = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();
function readCode(value) {
  const text = normalize(value);
  const id = text.startsWith("ACCESOUNI:") ? text.slice(10) : text;
  if (!/^[A-Z0-9-]{4,20}$/.test(id))
    throw new Error(
      "Código no compatible. Usa una matrícula o un QR AccesoUni.",
    );
  return id;
}
function demoState() {
  return {
    version: 1,
    capacity: 40,
    students: [
      {
        id: "20260001",
        name: "Ana Torres",
        career: "Ingeniería en Sistemas",
        semester: "7",
        validFrom: "2026-09-01",
        validUntil: "2027-08-31",
        photo: "",
        plate: "DEMO-101",
        vehicle: "Nissan Versa · Blanco",
        active: true,
      },
      {
        id: "20260002",
        name: "Luis Medina",
        career: "Administración",
        semester: "5",
        validFrom: "2026-09-01",
        validUntil: "2027-08-31",
        photo: "",
        plate: "DEMO-202",
        vehicle: "Chevrolet Aveo · Azul",
        active: true,
      },
      {
        id: "20260003",
        name: "Sofía Ruiz",
        career: "Arquitectura",
        semester: "3",
        validFrom: "2026-09-01",
        validUntil: "2027-08-31",
        photo: "",
        plate: "DEMO-303",
        vehicle: "Volkswagen Jetta · Gris",
        active: false,
      },
    ],
    visits: [],
  };
}
function vehicleFields(record) {
  const legacy = String(record.vehicle || "").split(" · ");
  return {
    model: String(record.model ?? legacy[0] ?? "").trim(),
    color: String(record.color ?? (legacy.length === 2 ? legacy[1] : "")).trim(),
  };
}
function validateStudent(student, students, originalId) {
  const s = {
    ...student,
    ...vehicleFields(student),
    id: readCode(student.id),
    name: String(student.name || "").trim(),
    career: String(student.career || "").trim(),
    semester: String(student.semester || "").trim(),
    ...COMMON_VALIDITY,
    photo: String(student.photo || ""),
    plate: normalize(student.plate),
    vehicle: String(student.vehicle || "").trim(),
    active: student.active !== false,
  };
  if (!s.name || !s.career || !s.plate)
    throw new Error("Completa todos los campos.");
  if (!s.model || !s.color) throw new Error("Completa el modelo y el color del vehículo.");
  s.vehicle = `${s.model} · ${s.color}`;
  if (!/^([1-9]|10)$/.test(s.semester))
    throw new Error("Selecciona un semestre entre 1 y 10.");
  if (!validDate(s.validFrom) || !validDate(s.validUntil))
    throw new Error("Escribe la vigencia con fechas reales en formato AAAA-MM-DD.");
  if (s.validUntil < s.validFrom)
    throw new Error("El fin de vigencia no puede ser anterior al inicio.");
  if (s.photo && (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s.photo) || s.photo.length > 1500000))
    throw new Error("La fotografía no es válida o es demasiado grande. Tómala de nuevo.");
  if (!/^[A-Z0-9-]{3,15}$/.test(s.plate))
    throw new Error(
      "Las placas deben tener entre 3 y 15 letras, números o guiones.",
    );
  if (students.some((x) => x.id === s.id && x.id !== originalId))
    throw new Error("Esta matrícula ya está registrada.");
  if (students.some((x) => x.plate === s.plate && x.id !== originalId))
    throw new Error("Estas placas ya pertenecen a otro registro.");
  return s;
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function credentialValidity(student) {
  const format = value => value.split("-").reverse().join("/");
  return validDate(student.validFrom) && validDate(student.validUntil)
    ? `${format(student.validFrom)} al ${format(student.validUntil)}`
    : "No registrada";
}
function inspect(state, code, mode) {
  const id = readCode(code);
  const student = state.students.find((x) => x.id === id);
  if (!student)
    throw new Error(
      "Matrícula no registrada. Solicita revisión al responsable.",
    );
  const open = state.visits.find((x) => x.studentId === id && !x.out);
  if (mode === "entry") {
    if (!student.active)
      throw new Error("Alumno deshabilitado. Entrada no autorizada.");
    if (open) throw new Error("Este vehículo ya tiene una entrada abierta.");
    if (state.visits.filter((x) => !x.out).length >= state.capacity)
      throw new Error("Estacionamiento lleno. Espera una salida.");
  } else if (mode === "exit") {
    if (!open) throw new Error("No hay una entrada abierta para este alumno.");
  } else throw new Error("Movimiento inválido.");
  return { student, open };
}
function move(state, code, mode, now = new Date().toISOString()) {
  const { student, open } = inspect(state, code, mode);
  if (mode === "entry")
    return {
      ...state,
      visits: [
        {
          id: `${student.id}-${now}`,
          studentId: student.id,
          name: student.name,
          plate: student.plate,
          vehicle: student.vehicle,
          ...vehicleFields(student),
          in: now,
          out: null,
        },
        ...state.visits,
      ],
    };
  return {
    ...state,
    visits: state.visits.map((v) =>
      v.id === open.id ? { ...v, out: now } : v,
    ),
  };
}
function duration(start, end = Date.now()) {
  const minutes = Math.max(
    0,
    Math.floor((new Date(end) - new Date(start)) / 60000),
  );
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
function validState(s) {
  return (
    s?.version === 1 &&
    Number.isInteger(s.capacity) &&
    s.capacity > 0 &&
    Array.isArray(s.students) &&
    Array.isArray(s.visits) &&
    s.students.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.name === "string" &&
        typeof x.plate === "string" &&
        typeof x.active === "boolean",
    ) &&
    s.visits.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.studentId === "string" &&
        Number.isFinite(Date.parse(x.in)) &&
        (x.out === null || Number.isFinite(Date.parse(x.out))),
    )
  );
}
module.exports = {
  normalize,
  readCode,
  demoState,
  validateStudent,
  inspect,
  move,
  duration,
  validState,
  validDate,
  credentialValidity,
  COMMON_VALIDITY,
  applyCommonValidity,
  vehicleFields,
};
