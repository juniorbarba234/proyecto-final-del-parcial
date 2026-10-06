import * as FS from "expo-file-system/legacy";
import { Platform } from "react-native";
const { demoState, validState, applyCommonValidity } = require("./domain.cjs");
const key = "accesouni-v1";
const path = FS.documentDirectory + "accesouni.json";
export async function saveState(state) {
  const text = JSON.stringify(state);
  if (Platform.OS === "web") {
    localStorage.setItem(key, text);
    return;
  }
  await FS.writeAsStringAsync(path + ".tmp", text);
  if ((await FS.getInfoAsync(path)).exists)
    await FS.copyAsync({ from: path, to: path + ".bak" });
  await FS.moveAsync({ from: path + ".tmp", to: path });
}
export async function loadState() {
  let text;
  if (Platform.OS === "web") text = localStorage.getItem(key);
  else if ((await FS.getInfoAsync(path)).exists)
    text = await FS.readAsStringAsync(path);
  else if ((await FS.getInfoAsync(path + ".bak")).exists)
    text = await FS.readAsStringAsync(path + ".bak");
  if (!text) {
    const state = demoState();
    await saveState(state);
    return state;
  }
  const state = JSON.parse(text);
  if (!validState(state))
    throw new Error("El archivo local no es válido. No se sobrescribió.");
  const updated = applyCommonValidity(state);
  if (updated !== state) await saveState(updated);
  return updated;
}
