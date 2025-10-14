import Constants from "expo-constants";

export function omitObject <T extends object> (obj: T, ...keys: Array<keyof T>): Partial<T> {
  const newObj: Partial<T> = {};
  const ks: Array<keyof T> = Object.keys(obj) as Array<keyof T>;
  ks.forEach((key: keyof T) => {
    if (!keys.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};


export function extractErrMsg (error: any): string {
  return error.response?.data?.error?.message || "Unknown error";
};

export function getUserAgent (): string {
  const name = Constants.expoConfig?.slug + Constants.expoConfig?.extra?.vrcmm?.buildProfile;
  const version = Constants.expoConfig?.version || "0.0.0-dev";
  const contact = Constants.expoConfig?.extra?.vrcmm?.contact || "dev@ktrn.dev";
  return `${name}/${version} ${contact}`;
}

export function getTintedColor (hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const a = hexColor.length == 9 ? parseInt(hexColor.slice(7, 9), 16) : 255;
  const newAlpha = Math.floor(a * 0.2);
  const newHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${newAlpha.toString(16).padStart(2, "0")}`;
  return newHex;
}