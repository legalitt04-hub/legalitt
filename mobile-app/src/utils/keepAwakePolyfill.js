// KeepAwake polyfill — used in BOTH Expo Go AND EAS builds via metro.config.js
// Zego SDK requires these EXACT export names: activateKeepAwake, deactivateKeepAwake
import { activateKeepAwakeAsync, deactivateKeepAwakeAsync } from 'expo-keep-awake';

// ✅ These match what Zego SDK imports: `{ activateKeepAwake, deactivateKeepAwake }`
export function activateKeepAwake() {
  try { activateKeepAwakeAsync(); } catch (_) {}
}

export function deactivateKeepAwake() {
  try { deactivateKeepAwakeAsync(); } catch (_) {}
}

export function useKeepAwake() {}

// Legacy aliases (kept for backward compat)
export const activate = activateKeepAwake;
export const deactivate = deactivateKeepAwake;

export default {
  activateKeepAwake,
  deactivateKeepAwake,
  useKeepAwake,
  activate,
  deactivate,
};
