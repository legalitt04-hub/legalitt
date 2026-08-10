import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

export const activate = () => {
  try {
    activateKeepAwakeAsync();
  } catch (e) {}
};

export const deactivate = () => {
  try {
    deactivateKeepAwake();
  } catch (e) {}
};

export function useKeepAwake() {}

export default {
  activate,
  deactivate,
  useKeepAwake,
};
