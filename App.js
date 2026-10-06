import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  BackHandler,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import QRCode from "react-native-qrcode-svg";
import { SvgCss } from "react-native-svg/css";
import uccLogo from "./assets/ucc-logo";
import { loadState, saveState } from "./src/storage";
const { searchCareers } = require("./src/careers.cjs");
const { semesters, semesterLabel } = require("./src/semesters.cjs");
const {
  demoState,
  readCode,
  validateStudent,
  inspect,
  move,
  duration,
  credentialValidity,
  COMMON_VALIDITY,
  vehicleFields,
} = require("./src/domain.cjs");

const C = {
  ink: "#063E55",
  muted: "#636466",
  paper: "#F3F7FA",
  green: "#007FAF",
  mint: "#E2F3F8",
  line: "#DCE5EB",
  red: "#B53A44",
  redLight: "#FFF0F0",
};
const pages = [
  ["Inicio", "⌂"],
  ["Control de acceso", "⇄"],
  ["Alumnos", "◎"],
  ["Vehículos dentro", "▣"],
  ["Historial", "◷"],
  ["Credenciales demo", "▤"],
  ["Configuración", "⚙"],
];
const clock = (value) =>
  new Date(value).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
const day = (value) =>
  new Date(value).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
function UniversityLogo({ width = 120 }) {
  return (
    <View
      accessible
      accessibilityLabel="Emblema Universidad Cristóbal Colón"
      style={{
        backgroundColor: "white",
        padding: 10,
        borderRadius: 12,
        alignSelf: "flex-start",
      }}
    >
      <SvgCss xml={uccLogo} width={width} height={(width * 235.3) / 533.2} />
    </View>
  );
}
function Button({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        danger && { backgroundColor: C.red },
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: C.ink }]}>{title}</Text>
    </Pressable>
  );
}
function SemesterPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 8 }}>
    <Text style={s.label}>Semestre</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Elegir semestre. ${semesterLabel(value)}`} accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={[s.input, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
      <Text style={{ flex: 1, color: value ? C.ink : C.muted, fontSize: 16 }}>{value ? semesterLabel(value) : "Selecciona tu semestre"}</Text>
      <Text style={{ color: C.green }}>{open ? "▲" : "▼"}</Text>
    </Pressable>
    {open && <View style={s.card}>
      {semesters.map(item => <Pressable key={item.value} accessibilityRole="radio" accessibilityLabel={item.label} accessibilityState={{ checked: String(value) === item.value }} onPress={() => { onChange(item.value); setOpen(false); }} style={{ padding: 14, minHeight: 48, borderRadius: 10, backgroundColor: String(value) === item.value ? C.mint : "white" }}>
        <Text style={{ color: C.ink, fontSize: 15 }}>{String(value) === item.value ? "✓  " : ""}{item.label}</Text>
      </Pressable>)}
      <Button secondary title="Cerrar lista" onPress={() => setOpen(false)} />
    </View>}
  </View>;
}
function CareerPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const groups = searchCareers(query);
  return (
    <View style={{ gap: 8 }}>
      <Text style={s.label}>Carrera</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`Elegir carrera. ${value || "Sin selección"}`} accessibilityState={{ expanded: open }} onPress={() => { setOpen(!open); setQuery(""); }} style={[s.input, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <Text style={{ flex: 1, color: value ? C.ink : C.muted, fontSize: 16 }}>{value || "Selecciona tu carrera"}</Text>
        <Text style={{ color: C.green }}>{open ? "▲" : "▼"}</Text>
      </Pressable>
      {open && <View style={[s.card, { gap: 12 }]}>
        <TextInput accessibilityLabel="Buscar carrera" placeholder="Buscar carrera o área" value={query} onChangeText={setQuery} style={s.input} autoCorrect={false} />
        <Text style={s.footnote}>21 licenciaturas UCC · Selecciona una opción</Text>
        {groups.map(group => <View key={group.area} style={{ gap: 4 }}>
          <Text style={[s.label, { color: C.green, marginTop: 8 }]}>{group.area}</Text>
          {group.careers.map(career => <Pressable key={career} accessibilityRole="radio" accessibilityState={{ checked: value === career }} accessibilityLabel={career} onPress={() => { onChange(career); setOpen(false); setQuery(""); }} style={{ paddingVertical: 14, paddingHorizontal: 10, borderRadius: 10, backgroundColor: value === career ? C.mint : "white", minHeight: 48 }}>
            <Text style={{ color: C.ink, fontSize: 15 }}>{value === career ? "✓  " : ""}{career}</Text>
          </Pressable>)}
        </View>)}
        {!groups.length && <Text style={s.body}>No hay coincidencias. Prueba otra palabra.</Text>}
        <Button secondary title="Cerrar lista" onPress={() => setOpen(false)} />
      </View>}
    </View>
  );
}
function Field({ label, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#81918F"
        maxLength={80}
        style={s.input}
        {...props}
      />
    </View>
  );
}
function Chip({ children, red = false }) {
  return (
    <View style={[s.chip, red && { backgroundColor: C.redLight }]}>
      <Text style={[s.chipText, red && { color: C.red }]}>{children}</Text>
    </View>
  );
}
function Empty({ title, detail }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyIcon}>◎</Text>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.body}>{detail}</Text>
    </View>
  );
}
function VehicleDetails({ record }) {
  const { model, color } = vehicleFields(record);
  return <View style={{ gap: 6 }}>
    <Text style={s.body}>Modelo: {model || "No registrado"}</Text>
    <Text style={s.body}>Color: {color || "No registrado"}</Text>
  </View>;
}
function StudentCard({ student, children }) {
  return (
    <View style={s.card}>
      <View style={s.row}>
        {student.photo ? <Image source={{ uri: student.photo }} style={{ width: 64, height: 80, borderRadius: 10 }} accessibilityLabel={`Fotografía registrada de ${student.name}`} /> : <View style={s.avatar}>
          <Text style={s.avatarText}>
            {student.name
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")}
          </Text>
        </View>}
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{student.name}</Text>
          <Text style={s.body}>
            {student.id} · {student.career}
          </Text>
        </View>
      </View>
      <Text style={s.body}>{semesterLabel(student.semester)}</Text>
      <Text style={s.body}>Vigencia: {credentialValidity(student)}</Text>
      <View style={s.plateRow}>
        <Text style={s.plate}>Placas: {student.plate}</Text>
      </View>
      <VehicleDetails record={student} />
      {children}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Application />
    </SafeAreaProvider>
  );
}
function Application() {
  const [state, setState] = useState(null),
    [error, setError] = useState(""),
    [splash, setSplash] = useState(true);
  const [page, setPage] = useState("Inicio"),
    [drawer, setDrawer] = useState(false),
    [mode, setMode] = useState("entry");
  const [modal, setModal] = useState(null),
    [form, setForm] = useState({}),
    [formError, setFormError] = useState("");
  const [search, setSearch] = useState(""),
    [manual, setManual] = useState(""),
    [camera, setCamera] = useState(false),
    [cameraError, setCameraError] = useState("");
  const [permission, requestPermission] = useCameraPermissions(),
    [busy, setBusy] = useState(false),
    [tick, setTick] = useState(Date.now());
  const [photoCapture, setPhotoCapture] = useState(false),
    [photoReady, setPhotoReady] = useState(false),
    [photoBusy, setPhotoBusy] = useState(false);
  const photoCamera = useRef(null), photoLock = useRef(false);
  const stateRef = useRef(null),
    writeLock = useRef(false),
    scanLock = useRef(false);
  const fade = useRef(new Animated.Value(0)).current,
    slide = useRef(new Animated.Value(-300)).current;
  useEffect(() => {
    loadState()
      .then((x) => {
        stateRef.current = x;
        setState(x);
      })
      .catch((e) => setError(e.message));
    const timer = setInterval(() => setTick(Date.now()), 30000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!splash) return;
    const timer = setTimeout(() => setSplash(false), 30000);
    return () => clearTimeout(timer);
  }, [splash]);
  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true,
    }).start();
  }, [page, splash]);
  useEffect(() => {
    Animated.timing(slide, {
      toValue: drawer ? 0 : -300,
      duration: 230,
      useNativeDriver: true,
    }).start();
  }, [drawer]);
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => {
      if (modal) {
        if (!busy && !photoLock.current) {
          setPhotoCapture(false);
          setModal(null);
          scanLock.current = false;
        }
        return true;
      }
      if (drawer) {
        setDrawer(false);
        return true;
      }
      if (page !== "Inicio") {
        navigate("Inicio");
        return true;
      }
      return false;
    });
    return () => h.remove();
  }, [modal, drawer, page, busy]);
  function navigate(next) {
    setCamera(false);
    setDrawer(false);
    setSearch("");
    setPage(next);
    scanLock.current = false;
  }
  async function persist(next) {
    if (writeLock.current) return false;
    writeLock.current = true;
    setBusy(true);
    try {
      await saveState(next);
      stateRef.current = next;
      setState(next);
      return true;
    } catch (e) {
      Alert.alert(
        "No se pudo guardar",
        "El cambio no se aplicó. Comprueba el espacio disponible y vuelve a intentarlo.",
      );
      return false;
    } finally {
      writeLock.current = false;
      setBusy(false);
    }
  }
  function check(code) {
    if (scanLock.current || writeLock.current) return;
    scanLock.current = true;
    setCamera(false);
    try {
      const id = readCode(code);
      const result = inspect(stateRef.current, id, mode);
      setModal({ type: "access", id, mode, ...result });
    } catch (e) {
      setModal({ type: "denied", message: e.message });
    }
  }
  function close() {
    if (busy || photoLock.current) return;
    setPhotoCapture(false);
    setModal(null);
    scanLock.current = false;
  }
  async function confirmAccess() {
    try {
      const next = move(stateRef.current, modal.id, modal.mode);
      if (await persist(next)) {
        setModal({ type: "success", mode: modal.mode, student: modal.student });
        setManual("");
      }
    } catch (e) {
      setModal({ type: "denied", message: e.message });
    }
  }
  async function startCamera() {
    setCameraError("");
    scanLock.current = false;
    try {
      const granted =
        permission?.granted || (await requestPermission()).granted;
      if (granted) setCamera(true);
      else
        Alert.alert(
          "Cámara sin permiso",
          "Puedes escribir la matrícula o habilitar la cámara en los ajustes del teléfono.",
          [
            { text: "Continuar" },
            { text: "Abrir ajustes", onPress: () => Linking.openSettings() },
          ],
        );
    } catch (e) {
      setCameraError("No se pudo abrir la cámara. Usa la captura manual.");
    }
  }
  function edit(student) {
    setPhotoCapture(false);
    setForm(
      student ? { ...student, ...vehicleFields(student) } : {
        id: "",
        name: "",
        career: "",
        semester: "",
        ...COMMON_VALIDITY,
        photo: "",
        plate: "",
        vehicle: "",
        model: "",
        color: "",
        active: true,
      },
    );
    setFormError("");
    setModal({ type: "student", originalId: student?.id });
  }
  async function startPhoto() {
    setFormError("");
    try {
      const granted = permission?.granted || (await requestPermission()).granted;
      if (!granted) throw new Error("Permite el uso de la cámara para tomar una foto. Puedes guardar sin fotografía.");
      setCamera(false);
      setPhotoReady(false);
      setPhotoCapture(true);
    } catch (e) { setFormError(e.message); }
  }
  async function capturePhoto() {
    if (!photoReady || photoLock.current || !photoCamera.current) return;
    photoLock.current = true;
    setPhotoBusy(true);
    try {
      const picture = await photoCamera.current.takePictureAsync({ quality: 0.25, base64: true });
      const photo = picture?.base64 ? `data:image/jpeg;base64,${picture.base64}` : "";
      if (!photo || photo.length > 1500000) throw new Error("No se pudo guardar una foto pequeña. Intenta de nuevo o continúa sin fotografía.");
      setForm(current => ({ ...current, photo }));
      setPhotoCapture(false);
    } catch (e) { setFormError(e.message); }
    finally { photoLock.current = false; setPhotoBusy(false); }
  }
  async function saveStudent() {
    try {
      const current = stateRef.current;
      const student = validateStudent(form, current.students, modal.originalId);
      if (
        modal.originalId &&
        current.visits.some((v) => v.studentId === modal.originalId && !v.out)
      )
        throw new Error("Registra la salida antes de modificar este alumno.");
      const students = modal.originalId
        ? current.students.map((x) => (x.id === modal.originalId ? student : x))
        : [...current.students, student];
      if (await persist({ ...current, students })) close();
    } catch (e) {
      setFormError(e.message);
    }
  }
  async function saveCapacity() {
    const n = Number(form.capacity);
    if (!Number.isInteger(n) || n < 1 || n > 9999 || n < inside.length) {
      setFormError(
        "Usa un número entre 1 y 9999, no menor que los vehículos dentro.",
      );
      return;
    }
    if (await persist({ ...stateRef.current, capacity: n })) close();
  }
  if (splash || (!state && !error))
    return (
      <Pressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel="Toca para continuar" onPress={() => setSplash(false)}>
      <LinearGradient colors={["#063E55", "#007FAF"]} style={s.splash}>
        <StatusBar style="light" />
        <View style={{ marginBottom: 28 }}>
          <UniversityLogo width={220} />
        </View>
        <Text style={s.splashTitle}>
          AccesoUni<Text style={{ color: "#6BC5D3" }}>.</Text>
        </Text>
        <Text style={s.splashSub}>UNIVERSIDAD CRISTÓBAL COLÓN</Text>
        <Text style={s.splashBottom}>
          CONTROL LOCAL · ESTACIONAMIENTO GRATUITO
        </Text>
        <Text style={{ color: "white", marginTop: 24, fontSize: 14 }}>Toca para continuar</Text>
      </LinearGradient>
      </Pressable>
    );
  if (error)
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.content}>
          <Text style={s.title}>No se pudo abrir el archivo local</Text>
          <Text style={s.body}>{error}</Text>
          <Text style={s.body}>
            Por seguridad no se borraron tus registros. Cierra y vuelve a abrir
            la app.
          </Text>
        </View>
      </SafeAreaView>
    );
  const inside = state.visits.filter((v) => !v.out),
    free = Math.max(0, state.capacity - inside.length);
  const today = state.visits.filter(
    (v) => new Date(v.in).toDateString() === new Date(tick).toDateString(),
  );
  const query = search.trim().toLowerCase();
  const match = (x) =>
    [x.name, x.id, x.studentId, x.plate, x.vehicle, x.model, x.color, x.in ? day(x.in) : ""]
      .join(" ")
      .toLowerCase()
      .includes(query);
  function visitCard(v) {
    return (
      <View style={s.card}>
        <View style={s.between}>
          <Text style={s.plate}>{v.plate}</Text>
          <Chip>{v.out ? "Finalizado" : "Dentro"}</Chip>
        </View>
        <Text style={s.cardTitle}>{v.name}</Text>
        <Text style={s.body}>
          Matrícula {v.studentId}
        </Text>
        <VehicleDetails record={v} />
        <View style={s.divider} />
        <Text style={s.body}>
          {day(v.in)} · Entrada {clock(v.in)}
        </Text>
        <Text style={s.body}>
          {v.out
            ? `Salida ${day(v.out)} · ${clock(v.out)}`
            : "Salida pendiente"}{" "}
          · {duration(v.in, v.out || tick)}
        </Text>
        {!v.out && (
          <Button
            secondary
            title="Registrar salida"
            onPress={() => {
              scanLock.current = false;
              const student = state.students.find((x) => x.id === v.studentId);
              setModal({
                type: "access",
                id: v.studentId,
                mode: "exit",
                student,
                open: v,
              });
            }}
          />
        )}
      </View>
    );
  }
  return (
    <SafeAreaView style={s.screen}>
      <StatusBar style="dark" />
      <View style={s.header}>
        <Pressable
          accessibilityLabel="Abrir menú lateral"
          accessibilityRole="button"
          onPress={() => setDrawer(true)}
          style={s.menuButton}
        >
          <Text style={s.menuGlyph}>☰</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.brand}>
            AccesoUni<Text style={{ color: C.green }}> .</Text>
          </Text>
          <Text style={s.headerSub}>UCC · CONTROL LOCAL</Text>
        </View>
        <UniversityLogo width={72} />
      </View>
      <Animated.View style={{ flex: 1, opacity: fade }}>
        {page === "Inicio" && (
          <ScrollView contentContainerStyle={s.content}>
            <View>
              <Text style={s.eyebrow}>{day(tick).toUpperCase()}</Text>
              <Text style={s.title}>Bienvenido a la caseta</Text>
              <Text style={s.body}>
                Cada entrada cuenta. Cada salida queda registrada.
              </Text>
            </View>
            <LinearGradient colors={["#063E55", "#007FAF"]} style={s.hero}>
              <View style={s.between}>
                <Text style={s.heroLabel}>OCUPACIÓN DEL CAMPUS</Text>
                <Chip>Sin cobro</Chip>
              </View>
              <Text style={s.heroNumber}>
                {inside.length}
                <Text style={s.heroSmall}> / {state.capacity}</Text>
              </Text>
              <Text style={s.heroBody}>
                vehículos dentro del estacionamiento
              </Text>
              <View style={s.track}>
                <View
                  style={[
                    s.progress,
                    {
                      width: `${Math.min(100, (inside.length / state.capacity) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <View style={s.between}>
                <Text style={s.heroBody}>{free} espacios disponibles</Text>
                <Text style={s.heroBody}>
                  {Math.round((inside.length / state.capacity) * 100)}%
                </Text>
              </View>
            </LinearGradient>
            <View style={s.row}>
              <View style={[s.stat, { flex: 1 }]}>
                <Text style={s.statNumber}>{today.length}</Text>
                <Text style={s.body}>Entradas hoy</Text>
              </View>
              <View style={[s.stat, { flex: 1 }]}>
                <Text style={s.statNumber}>
                  {state.students.filter((x) => x.active).length}
                </Text>
                <Text style={s.body}>Alumnos habilitados</Text>
              </View>
            </View>
            <Text style={s.sectionTitle}>¿Qué quieres registrar?</Text>
            <Button
              title="↗  Registrar entrada"
              onPress={() => {
                setMode("entry");
                navigate("Control de acceso");
              }}
            />
            <Button
              secondary
              title="↙  Registrar salida"
              onPress={() => {
                setMode("exit");
                navigate("Control de acceso");
              }}
            />
            <View style={s.between}>
              <Text style={s.sectionTitle}>Últimos movimientos</Text>
              <Pressable onPress={() => navigate("Historial")}>
                <Text style={s.link}>Ver todos →</Text>
              </Pressable>
            </View>
            {state.visits.length ? (
              state.visits
                .slice(0, 3)
                .map((v) => <View key={v.id}>{visitCard(v)}</View>)
            ) : (
              <Empty
                title="Todo listo para comenzar"
                detail="Registra una entrada escaneando una credencial de demostración."
              />
            )}
            <Text style={s.footnote}>
              Prototipo académico · Datos ficticios · Un solo dispositivo
            </Text>
          </ScrollView>
        )}
        {page === "Control de acceso" && (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.content}
          >
            <Text style={s.eyebrow}>CASETA DIGITAL</Text>
            <Text style={s.title}>Verifica una credencial</Text>
            <Text style={s.body}>
              Selecciona el movimiento antes de escanear.
            </Text>
            <View style={s.segment}>
              {[
                ["entry", "Entrada"],
                ["exit", "Salida"],
              ].map(([value, label]) => (
                <Pressable
                  key={value}
                  onPress={() => {
                    setMode(value);
                    scanLock.current = false;
                  }}
                  style={[s.segmentItem, mode === value && s.segmentActive]}
                >
                  <Text style={[s.label, mode === value && { color: "white" }]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={s.scanner}>
              {camera && !modal ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      "qr",
                      "code128",
                      "code39",
                      "pdf417",
                      "ean13",
                    ],
                  }}
                  onBarcodeScanned={({ data }) => check(data)}
                  onMountError={() => {
                    setCamera(false);
                    setCameraError(
                      "La cámara no está disponible. Usa la matrícula manual.",
                    );
                  }}
                />
              ) : (
                <View style={s.scannerCenter}>
                  <Text style={s.scanGlyph}>▣</Text>
                  <Text style={s.scannerText}>
                    Coloca el código de la credencial{"\n"}dentro del encuadre
                  </Text>
                </View>
              )}
              <View pointerEvents="none" style={s.frame} />
              <View style={s.scanTag}>
                <Text style={s.scannerText}>
                  {mode === "entry" ? "LECTOR DE ENTRADA" : "LECTOR DE SALIDA"}
                </Text>
              </View>
            </View>
            <Button
              title={
                camera ? "Apagar cámara" : "Activar lector de credenciales"
              }
              onPress={camera ? () => setCamera(false) : startCamera}
            />
            {!!cameraError && <Text style={s.error}>{cameraError}</Text>}
            <View style={s.card}>
              <Text style={s.cardTitle}>¿No puedes escanear?</Text>
              <Field
                label="Matrícula del alumno"
                value={manual}
                onChangeText={setManual}
                autoCapitalize="characters"
                placeholder="Ej. 20260001"
                onSubmitEditing={() => check(manual)}
              />
              <Button
                secondary
                title="Consultar matrícula"
                disabled={!manual.trim()}
                onPress={() => check(manual)}
              />
            </View>
            <Text style={s.footnote}>
              QR de prueba: ACCESOUNI:20260001. También acepta una matrícula en
              texto. Compara siempre la foto de la credencial y las placas.
            </Text>
          </ScrollView>
        )}
        {page === "Alumnos" && (
          <View style={[s.content, { flex: 1 }]}>
            <Text style={s.title}>Padrón de alumnos</Text>
            <Text style={s.body}>
              {state.students.length} registros · autorización local
            </Text>
            <Button
              title="＋ Registrar alumno y vehículo"
              onPress={() => edit()}
            />
            <Field
              label="Buscar alumno o placas"
              value={search}
              onChangeText={setSearch}
              placeholder="Nombre, matrícula o placas"
            />
            <FlatList
              data={state.students.filter(match)}
              keyExtractor={(x) => x.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              ListEmptyComponent={
                <Empty
                  title="Sin coincidencias"
                  detail="Prueba otra búsqueda o registra un alumno."
                />
              }
              renderItem={({ item }) => (
                <StudentCard student={item}>
                  <View style={s.between}>
                    <Chip red={!item.active}>
                      {item.active ? "Habilitado" : "Deshabilitado"}
                    </Chip>
                    <Pressable onPress={() => edit(item)}>
                      <Text style={s.link}>Editar →</Text>
                    </Pressable>
                  </View>
                </StudentCard>
              )}
            />
          </View>
        )}
        {(page === "Vehículos dentro" || page === "Historial") && (
          <View style={[s.content, { flex: 1 }]}>
            <Text style={s.title}>{page}</Text>
            <Text style={s.body}>
              {page === "Historial"
                ? "Entradas, salidas y tiempo de permanencia."
                : `${inside.length} vehículos · ${free} lugares disponibles`}
            </Text>
            <Field
              label="Buscar registro"
              value={search}
              onChangeText={setSearch}
              placeholder="Alumno, placas, matrícula o fecha"
            />
            <FlatList
              data={(page === "Historial" ? state.visits : inside).filter(
                match,
              )}
              keyExtractor={(x) => x.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
              renderItem={({ item }) => visitCard(item)}
              ListEmptyComponent={
                <Empty
                  title="No hay registros"
                  detail="Los movimientos aparecerán aquí después de registrar una entrada."
                />
              }
            />
          </View>
        )}
        {page === "Credenciales demo" && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.eyebrow}>MATERIAL PARA EXPONER</Text>
            <Text style={s.title}>Prueba el lector</Text>
            <Text style={s.body}>
              Muestra estas credenciales en otra pantalla o utiliza el archivo
              imprimible incluido. Son ficticias, no oficiales.
            </Text>
            {state.students.map((student) => (
              <View key={student.id} style={s.credential}>
                <View style={s.between}>
                  <UniversityLogo width={115} />
                  <Chip red={!student.active}>
                    {student.active ? "Habilitado" : "Deshabilitado"}
                  </Chip>
                </View>
                <Text style={s.eyebrow}>CREDENCIAL DE DEMOSTRACIÓN</Text>
                <Text style={s.title}>{student.name}</Text>
                <Text style={s.body}>{student.career}</Text>
                {student.photo ? <Image source={{ uri: student.photo }} style={{ width: 96, height: 120, borderRadius: 12, alignSelf: "center" }} accessibilityLabel={`Fotografía de ${student.name}`} /> : <Text style={s.footnote}>Sin fotografía registrada</Text>}
                <Text style={s.body}>{semesterLabel(student.semester)}</Text>
                <Text style={s.body}>Vigencia: {credentialValidity(student)}</Text>
                <View style={s.qr}>
                  <QRCode value={`ACCESOUNI:${student.id}`} size={160} />
                </View>
                <Text style={s.credentialId}>{student.id}</Text>
                <Text style={s.body}>
                  Placas: {student.plate}
                </Text>
                <VehicleDetails record={student} />
                <Button
                  secondary
                  title="Simular lectura de esta credencial"
                  onPress={() => {
                    scanLock.current = false;
                    check(student.id);
                  }}
                />
                <Text style={s.footnote}>
                  Movimiento seleccionado:{" "}
                  {mode === "entry" ? "entrada" : "salida"}. La simulación usa
                  las mismas validaciones.
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
        {page === "Configuración" && (
          <ScrollView contentContainerStyle={s.content}>
            <Text style={s.title}>Configuración</Text>
            <View style={s.card}>
              <Text style={s.cardTitle}>Capacidad del estacionamiento</Text>
              <Text style={s.statNumber}>{state.capacity} lugares</Text>
              <Button
                secondary
                title="Cambiar capacidad"
                onPress={() => {
                  setForm({ capacity: String(state.capacity) });
                  setFormError("");
                  setModal({ type: "capacity" });
                }}
              />
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Cómo funciona</Text>
              <Text style={s.body}>
                1. Revisa la credencial oficial antes de registrar al alumno.
                {"\n\n"}2. Escanea o escribe la matrícula.{"\n\n"}3. Compara
                nombre, foto física y placas.{"\n\n"}4. Confirma entrada o
                salida.
              </Text>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>Local y gratuito</Text>
              <Text style={s.body}>
                Los datos se guardan en un archivo JSON del teléfono. No hay
                bases de datos, servidores ni consultas a APIs. No hay cobros ni
                sincronización entre dispositivos.
              </Text>
              <Text style={s.body}>
                No es un sistema institucional de seguridad: un código puede
                copiarse. El padrón es administrado por el operador, sin
                autenticación institucional. No introduzcas datos reales en esta
                demostración.
              </Text>
            </View>
            <Button
              secondary
              title="Volver a ver la bienvenida"
              onPress={() => {
                setSplash(true);
              }}
            />
            <Button
              danger
              title="Restablecer datos de demostración"
              onPress={() => setModal({ type: "reset" })}
            />
            <Text style={s.footnote}>
              AccesoUni 1.0 · Proyecto académico React Native + Expo
            </Text>
          </ScrollView>
        )}
      </Animated.View>
      <Modal
        transparent
        visible={drawer}
        animationType="fade"
        onRequestClose={() => setDrawer(false)}
      >
        <View style={s.drawerOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDrawer(false)}
            accessibilityLabel="Cerrar menú"
          />
          <Animated.View
            style={[s.drawer, { transform: [{ translateX: slide }] }]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={s.drawerBrand}>
                <UniversityLogo width={176} />
                <Text style={[s.brand, { color: "white", fontSize: 28 }]}>
                  AccesoUni.
                </Text>
                <Text style={s.heroBody}>Universidad Cristóbal Colón</Text>
              </View>
              {pages.map(([name, icon]) => (
                <Pressable
                  accessibilityRole="button"
                  key={name}
                  onPress={() => navigate(name)}
                  style={[
                    s.drawerItem,
                    page === name && { backgroundColor: "#007FAF" },
                  ]}
                >
                  <Text style={s.drawerIcon}>{icon}</Text>
                  <Text style={s.drawerText}>{name}</Text>
                </Pressable>
              ))}
              <View style={{ marginTop: "auto", padding: 22 }}>
                <Text style={s.heroBody}>● Sin conexión a servidores</Text>
                <Text style={s.splashSub}>PROTOTIPO ACADÉMICO</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
      <Modal
        transparent
        visible={!!modal}
        animationType="slide"
        onRequestClose={close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.modalOverlay}
        >
          <View style={s.sheet}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 15, padding: 24 }}
            >
              {modal?.type === "access" && (
                <>
                  <Chip>
                    {modal.mode === "entry"
                      ? "ALUMNO HABILITADO"
                      : "SALIDA DISPONIBLE"}
                  </Chip>
                  <Text style={s.title}>
                    {modal.mode === "entry"
                      ? "Confirma el acceso"
                      : "Confirma la salida"}
                  </Text>
                  <StudentCard student={modal.student} />
                  <Text style={s.body}>
                    Verifica que las placas coincidan y compara a la persona con
                    la foto de su credencial oficial.
                  </Text>
                  {modal.open && (
                    <Text style={s.body}>
                      Permanencia: {duration(modal.open.in, tick)}
                    </Text>
                  )}
                  <Button
                    disabled={busy}
                    title={
                      busy
                        ? "Guardando…"
                        : modal.mode === "entry"
                          ? "Confirmar entrada"
                          : "Confirmar salida"
                    }
                    onPress={confirmAccess}
                  />
                </>
              )}
              {modal?.type === "success" && (
                <>
                  <Text style={[s.resultIcon, { color: C.green }]}>✓</Text>
                  <Text style={s.title}>
                    {modal.mode === "entry"
                      ? "Entrada registrada"
                      : "Salida registrada"}
                  </Text>
                  <Text style={s.body}>
                    {modal.student.name} · {modal.student.plate}
                  </Text>
                  <Chip>Guardado en este dispositivo</Chip>
                </>
              )}
              {modal?.type === "denied" && (
                <>
                  <Text style={[s.resultIcon, { color: C.red }]}>!</Text>
                  <Text style={s.title}>Movimiento no permitido</Text>
                  <Text style={s.error}>{modal.message}</Text>
                  <Text style={s.body}>No se registró ningún movimiento.</Text>
                </>
              )}
              {modal?.type === "student" && (
                <>
                  <Text style={s.title}>
                    {modal.originalId ? "Editar alumno" : "Nuevo alumno"}
                  </Text>
                  <Text style={s.body}>
                    Verifica primero su credencial. Un vehículo por matrícula en
                    este prototipo.
                  </Text>
                  {[
                    ["id", "Matrícula", "20260004"],
                    ["name", "Nombre completo", "Nombre y apellidos"],
                    ["career", "Carrera", ""],
                    ["semester", "Semestre", "Ej. 7"],
                    ["plate", "Placas", "DEMO-404"],
                    ["model", "Marca y modelo del vehículo", "Toyota Yaris"],
                    ["color", "Color del vehículo", "Rojo"],
                  ].map(([key, label, placeholder]) => key === "career" ? (
                    <CareerPicker key={key} value={form.career} onChange={career => setForm(current => ({ ...current, career }))} />
                  ) : key === "semester" ? (
                    <SemesterPicker key={key} value={form.semester} onChange={semester => setForm(current => ({ ...current, semester }))} />
                  ) : (
                    <Field
                      key={key}
                      label={label}
                      placeholder={placeholder}
                      value={form[key]}
                      editable={!(key === "id" && modal.originalId)}
                      onChangeText={(value) =>
                        setForm({ ...form, [key]: value })
                      }
                      autoCapitalize={
                        key === "plate" || key === "id" ? "characters" : "words"
                      }
                    />
                  ))}
                  <Text style={s.label}>Vigencia de la credencial</Text>
                  <Text style={s.body}>Del 1 de septiembre de 2026 al 31 de agosto de 2027</Text>
                  <Text style={s.footnote}>Se asigna automáticamente a todos los alumnos.</Text>
                  <Text style={s.label}>Fotografía del alumno (opcional)</Text>
                  {form.photo ? <Image source={{ uri: form.photo }} style={{ width: 96, height: 120, borderRadius: 12, alignSelf: "center" }} accessibilityLabel="Vista previa de fotografía" /> : null}
                  {photoCapture ? <>
                    <CameraView ref={photoCamera} style={{ height: 240, borderRadius: 14, overflow: "hidden" }} facing="front" mode="picture" onCameraReady={() => setPhotoReady(true)} onMountError={() => { setPhotoCapture(false); setFormError("La cámara no está disponible. Puedes guardar sin foto."); }} />
                    <Button title={photoBusy ? "Capturando…" : "Capturar fotografía"} disabled={!photoReady || photoBusy} onPress={capturePhoto} />
                    <Button secondary title="Cancelar fotografía" disabled={photoBusy} onPress={() => setPhotoCapture(false)} />
                  </> : <Button secondary title={form.photo ? "Cambiar fotografía" : "Tomar fotografía"} onPress={startPhoto} />}
                  {!!form.photo && <Button secondary title="Quitar fotografía" onPress={() => setForm(current => ({ ...current, photo: "" }))} />}
                  <Text style={s.footnote}>Foto y datos se guardan solo en este dispositivo. El código identifica la matrícula; no descarga información de la UCC. La vigencia es informativa y el operador debe revisarla.</Text>
                  <View style={s.between}>
                    <Text style={s.label}>Autorizar entradas</Text>
                    <Switch
                      value={form.active}
                      onValueChange={(active) => setForm({ ...form, active })}
                      trackColor={{ true: C.green }}
                    />
                  </View>
                  {!!formError && <Text style={s.error}>{formError}</Text>}
                  <Button
                    disabled={busy || photoCapture || photoBusy}
                    title={busy ? "Guardando…" : "Guardar registro"}
                    onPress={saveStudent}
                  />
                </>
              )}
              {modal?.type === "capacity" && (
                <>
                  <Text style={s.title}>Lugares disponibles</Text>
                  <Field
                    label="Capacidad total"
                    value={form.capacity}
                    onChangeText={(capacity) => setForm({ capacity })}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                  {!!formError && <Text style={s.error}>{formError}</Text>}
                  <Button
                    title="Guardar capacidad"
                    disabled={busy}
                    onPress={saveCapacity}
                  />
                </>
              )}
              {modal?.type === "reset" && (
                <>
                  <Text style={s.title}>¿Borrar los registros locales?</Text>
                  <Text style={s.body}>
                    Se eliminarán alumnos y movimientos de esta app y se
                    cargarán tres alumnos ficticios. Esta acción no se puede
                    deshacer desde la app.
                  </Text>
                  <Button
                    danger
                    disabled={busy}
                    title="Sí, restablecer demostración"
                    onPress={async () => {
                      if (await persist(demoState())) close();
                    }}
                  />
                </>
              )}
              <Button
                secondary
                disabled={busy || photoBusy}
                title={
                  modal?.type === "success" || modal?.type === "denied"
                    ? "Listo"
                    : "Cancelar"
                }
                onPress={close}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.paper,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  content: { padding: 22, gap: 16, paddingBottom: 32 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  brand: { fontSize: 23, fontWeight: "900", color: C.ink, letterSpacing: -0.7 },
  headerSub: {
    fontSize: 9,
    letterSpacing: 2,
    color: C.muted,
    fontWeight: "700",
  },
  menuButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  menuGlyph: { fontSize: 23, color: C.ink },
  local: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.green },
  localText: { fontSize: 12, color: C.green, fontWeight: "700" },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.6,
    fontWeight: "800",
    color: C.green,
  },
  title: { fontSize: 27, fontWeight: "800", color: C.ink, letterSpacing: -0.6 },
  body: { fontSize: 14, lineHeight: 22, color: C.muted },
  label: { fontSize: 13, fontWeight: "700", color: C.ink },
  input: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 13,
    padding: 14,
    backgroundColor: "white",
    color: C.ink,
    fontSize: 16,
    minHeight: 50,
  },
  button: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  buttonText: { fontWeight: "800", fontSize: 15, color: "white" },
  secondary: { backgroundColor: "white", borderWidth: 1, borderColor: C.line },
  hero: { padding: 22, borderRadius: 24, gap: 10 },
  heroLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: "#D4EBF5",
    fontWeight: "700",
  },
  heroNumber: {
    fontSize: 66,
    fontWeight: "800",
    color: "white",
    letterSpacing: -3,
  },
  heroSmall: { fontSize: 24, color: "#9FD9E7", letterSpacing: 0 },
  heroBody: { fontSize: 12, color: "#CEE7F0", lineHeight: 20 },
  track: {
    height: 7,
    backgroundColor: "#2D6C85",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 6,
  },
  progress: { height: 7, backgroundColor: "#6BC5D3", borderRadius: 5 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  stat: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: C.line,
  },
  statNumber: { fontSize: 30, fontWeight: "800", color: C.ink },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: C.ink },
  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: C.ink },
  chip: {
    backgroundColor: C.mint,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  chipText: { fontSize: 11, fontWeight: "800", color: C.green },
  plate: { fontSize: 17, fontWeight: "800", color: C.ink, letterSpacing: 1 },
  plateRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: C.line,
    paddingTop: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontWeight: "800", color: C.green },
  divider: { height: 1, backgroundColor: C.line },
  link: { fontWeight: "700", color: C.green, fontSize: 13, paddingVertical: 8 },
  footnote: { fontSize: 11, lineHeight: 18, color: C.muted },
  empty: { padding: 24, alignItems: "center", gap: 10 },
  emptyIcon: { fontSize: 38, color: C.green },
  segment: {
    backgroundColor: "#E1EBF1",
    padding: 5,
    borderRadius: 14,
    flexDirection: "row",
  },
  segmentItem: { flex: 1, padding: 13, alignItems: "center", borderRadius: 10 },
  segmentActive: { backgroundColor: C.ink },
  scanner: {
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerCenter: { alignItems: "center", gap: 8 },
  scanGlyph: { fontSize: 68, color: "#6BC5D3" },
  scannerText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  frame: {
    position: "absolute",
    width: 210,
    height: 170,
    borderWidth: 2,
    borderColor: "#6BC5D3",
    borderRadius: 18,
    top: 22,
  },
  scanTag: {
    position: "absolute",
    bottom: 15,
    backgroundColor: "#063E55DD",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
  },
  credential: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 22,
    padding: 22,
    gap: 15,
  },
  qr: { alignItems: "center", padding: 18, backgroundColor: "white" },
  credentialId: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
    color: C.ink,
  },
  error: { color: C.red, fontSize: 14, lineHeight: 22 },
  drawerOverlay: { flex: 1, backgroundColor: "#00000066" },
  drawer: { width: 290, height: "100%", backgroundColor: C.ink },
  drawerBrand: { padding: 24, gap: 8, marginBottom: 15 },
  drawerItem: {
    flexDirection: "row",
    gap: 15,
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  drawerIcon: { color: "#6BC5D3", fontSize: 23, width: 28 },
  drawerText: { color: "white", fontWeight: "600", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000077",
    justifyContent: "center",
    padding: 18,
  },
  sheet: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    maxHeight: "90%",
    borderRadius: 24,
    backgroundColor: C.paper,
    overflow: "hidden",
  },
  resultIcon: { fontSize: 60, fontWeight: "800", textAlign: "center" },
  splash: { flex: 1, alignItems: "center", justifyContent: "center" },
  splashMark: {
    width: 92,
    height: 92,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#6BC5D3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  splashLetter: { fontSize: 62, fontWeight: "900", color: "#6BC5D3" },
  splashTitle: {
    fontSize: 44,
    fontWeight: "900",
    color: "white",
    letterSpacing: -2,
  },
  splashSub: {
    color: "#D2EAF2",
    fontSize: 9,
    letterSpacing: 1.4,
    marginTop: 12,
  },
  splashBottom: {
    position: "absolute",
    bottom: 64,
    fontSize: 9,
    color: "#D2EAF2",
    letterSpacing: 1,
  },
});
