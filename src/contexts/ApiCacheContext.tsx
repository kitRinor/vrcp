// VRCのAPIを使うためのContext
import { User, World } from "@/api/vrchat";
import * as FileSystem from 'expo-file-system';
import { createContext, ReactNode, useContext } from "react";
import useVRChat from "./VRChatContext";

// json-Data Cache in Memory
// use for individual World, User, ..etc data
// should not use for realtime-needed data like Instance, Notification, ..etc

interface Cache<T> {
  expiredAt: string;
  value: T;
}

interface CacheWrapper<T> {
  get: (id: string) => Promise<T>;
  set: (id: string, data: T) => Promise<void>;
  delete: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  getInfo: () => Promise<{size: number, count: number}>;
}

interface CacheContextType {
  clearCache: () => Promise<void>;
  getCacheInfo: () => Promise<{size: number, count: number}>;


  users: CacheWrapper<User>;
  worlds: CacheWrapper<World>;
}

const cacheDir = `${FileSystem.documentDirectory}cache/vrcapi/`;
const getLocalUri = async (id: string, childDirName: string) => {
  // separate data dir with endpoint of api
  // vrchat id is unique, so we can use it as key
  return cacheDir + childDirName + "/" + id;
}

const Context = createContext<CacheContextType | undefined>(undefined)

const useApiCache = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error("useCache must be used within a CacheProvider")
  }
  return context
}
const ApiCacheProvider: React.FC<{ children?: ReactNode }> = ({children}) => {
  const vrc = useVRChat();


  const getWorld = async (id: string) => (await vrc.worldsApi.getWorld(id)).data;
  const getUser = async (id: string) => (await vrc.usersApi.getUser(id)).data;
  const values = {
    users: createCacheWrapper<User>("users", getUser),
    worlds: createCacheWrapper<World>("worlds", getWorld),
  };

  
  const clearCache = async () => {
    await Promise.all(
      Object.values(values).map(wrapper => wrapper.clear())
    );
  }
  const getCacheInfo = async () => {
    const infos = await Promise.all(
      Object.values(values).map(wrapper => wrapper.getInfo())
    );
    const total = infos.reduce((acc, info) => ({
      size: acc.size + info.size,
      count: acc.count + info.count
    }), {size: 0, count: 0});
    return total;
  }

  return (
    <Context.Provider value={{
      clearCache,
      getCacheInfo,
      ...values
    }}>
      {children}
    </Context.Provider>
  )
} 


function createCacheWrapper<T>(childDir: string, getter: (id: string) => Promise<T>): CacheWrapper<T> {

  // initiate cache directory
  FileSystem.makeDirectoryAsync(cacheDir + childDir, { intermediates: true });

  const get = async (id: string): Promise<T> => {
    const localUri = await getLocalUri(id, childDir);
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      const fileContent = await FileSystem.readAsStringAsync(localUri);
      const cache: Cache<T> = JSON.parse(fileContent);
      if (new Date() < new Date(cache.expiredAt)) {
        return cache.value;
      } 
    } 
    // no-cached or cached-but-expired, get and set with new data
    const data = await getter(id);
    const newCache: Cache<T> = {
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expire in 24 hours
      value: data
    };
    await FileSystem.writeAsStringAsync(localUri, JSON.stringify(newCache));
    return data;
  }
  const set = async (id: string, data: T) => {
    const localUri = await getLocalUri(id, childDir);
    const newCache: Cache<T> = {
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // expire in 24 hours
      value: data
    };
    await FileSystem.writeAsStringAsync(localUri, JSON.stringify(newCache));
  }
  const del = async (id: string) => {
    const localUri = await getLocalUri(id, childDir);
    await FileSystem.deleteAsync(localUri, { idempotent: true });
  }
  const clear = async () => {
    await FileSystem.deleteAsync(cacheDir + childDir, { idempotent: true });
    await FileSystem.makeDirectoryAsync(cacheDir + childDir, { intermediates: true });
  }
  const getInfo = async () => {
    const dirInfo = await FileSystem.getInfoAsync(cacheDir + childDir);
    if (dirInfo.exists) {
      const files = await FileSystem.readDirectoryAsync(cacheDir + childDir);
      return { size: dirInfo.size, count: files.length };
    }
    return { size: 0, count: 0 };
  }
  return { get, set, delete: del, clear, getInfo };
}


export default useApiCache
export { ApiCacheProvider };

