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