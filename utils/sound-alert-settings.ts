import AsyncStorage from "@react-native-async-storage/async-storage";

export const SETTINGS_STORAGE_KEY = "sound_alert_settings";

export interface SoundAlertSettings {
  /** Master toggle — if false, detection loop never starts */
  soundDetection: boolean;
  alertTypes: {
    carHorns: boolean;
    busHorns: boolean;
    truckHorns: boolean;
    trainHorns: boolean;
    motorcycleHorns: boolean;
  };
  /** Whether to vibrate on any alert */
  vibration: boolean;
  /** Whether to flash the screen on alert */
  screenFlash: boolean;
  /** Whether to show banners / emergency overlays */
  showBanners: boolean;
}

export const DEFAULT_SETTINGS: SoundAlertSettings = {
  soundDetection: true,
  alertTypes: {
    carHorns: true,
    busHorns: true,
    truckHorns: true,
    trainHorns: true,
    motorcycleHorns: true,
  },
  vibration: true,
  screenFlash: true,
  showBanners: true,
};

export async function loadSettings(): Promise<SoundAlertSettings> {
  try {
    const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    // Deep-merge so new keys added later get their defaults
    const parsed = JSON.parse(stored) as Partial<SoundAlertSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      alertTypes: {
        ...DEFAULT_SETTINGS.alertTypes,
        ...(parsed.alertTypes ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(
  settings: SoundAlertSettings,
): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Returns true if the detection result should be shown given the current settings.
 * predicted_class uses the normalised format from soundAlertService (e.g. "car horns").
 */
export function isAlertTypeEnabled(
  predicted_class: string,
  settings: SoundAlertSettings,
): boolean {
  const { alertTypes } = settings;
  switch (predicted_class) {
    case "car horns":
      return alertTypes.carHorns;
    case "bus horns":
      return alertTypes.busHorns;
    case "truck horns":
      return alertTypes.truckHorns;
    case "train horns":
      return alertTypes.trainHorns;
    case "motorcycle horns":
      return alertTypes.motorcycleHorns;
    default:
      // Emergency classes (ambulance-siren, fire-alarm, etc.) are always enabled
      return true;
  }
}
