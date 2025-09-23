import { CurrentUser, FavoriteGroup, LimitedUserFriend } from '@/vrchat/api';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useVRChat } from './VRChatContext';
import { PipelineContent, PipelineType } from '@/vrchat/pipline/type';
import { convertUserToLimitedUserFriend } from '@/lib/vrchatUtils';



// Store VRCAPI Data Globally

interface DataWrapper<T> {
  data: T;
  isLoading: boolean;
  fetch: () => Promise<T>;
  set: (v: React.SetStateAction<T>) => void;
  clear: () => void;
}

interface DataContextType {
  fetchAll: () => Promise<void>;
  clearAll: () => Promise<void>;

  currentUser: DataWrapper<CurrentUser | undefined>;

  friends: DataWrapper<LimitedUserFriend[]>; // all friends

  favoriteGroups: DataWrapper<FavoriteGroup[]>;

}

const Context = createContext<DataContextType | undefined>(undefined)

const useData = () => {
  const context = useContext(Context)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}

const DataProvider: React.FC<{ children?: React.ReactNode }> = ({children}) => {
  const auth = useAuth();
  const vrc = useVRChat();


  /** APIs */
  // data getters
  const getCurrentUser = async () => (await vrc.authenticationApi.getCurrentUser()).data;
  const getFavoriteGroups = async () => (await vrc.favoritesApi.getFavoriteGroups()).data;
  const getFriends = async () => {
    const res = await Promise.all([
      vrc.friendsApi.getFriends(0, 100, false), // online or active
      vrc.friendsApi.getFriends(0, 100, true), // offline
      vrc.friendsApi.getFriends(100, 100, true) // offline-2
    ])
    return res.flatMap(r => r.data);
  };
  //
  const values = {
    currentUser: initDataWrapper<CurrentUser | undefined>(undefined, getCurrentUser),
    favoriteGroups: initDataWrapper<FavoriteGroup[]>([], getFavoriteGroups),
    friends: initDataWrapper<LimitedUserFriend[]>([], getFriends),
  }

  const fetchAll = async () => {
    await Promise.all(Object.values(values).map(v => v.fetch()));
  }
  const clearAll = async () => {
    await Promise.all(Object.values(values).map(v => v.clear()));
  }

  useEffect(() => {
    if (auth.user) {
      fetchAll().catch(console.error);
    } else {
      clearAll(); // clear data on logout
    }
  }, [auth.user]);

  /** Pipelines */
  // Apply pipeline messages to update states
  const applyPipeMsgToStates = <T extends PipelineType>(type: T, content: PipelineContent<T>) => {
    // about friends only for now 
    if ((["friend-update", "friend-location", "friend-online", "friend-active"] as PipelineType[]).includes(type)) {
      const data = content as PipelineContent<"friend-update" | "friend-location" | "friend-online" | "friend-active">;
      if (values.friends.data.find(f => f.id === data.userId) != undefined) {
        values.friends.set(prev => prev.map(f => f.id === data.userId ? { ...f, ...data.user } : f));
      } else {
        values.friends.set(prev => [...prev, convertUserToLimitedUserFriend(data.user)]);
      }
    } else if (type == "friend-offline") {
      const data = content as PipelineContent<"friend-offline">;
      values.friends.set(prev => prev.map(f => f.id === data.userId ? { ...f, location: "offline"} : f));
    } else if (type == "friend-add") {
      const data = content as PipelineContent<"friend-add">;
      values.friends.set(prev => [...prev, convertUserToLimitedUserFriend(data.user)]);
    } else if (type == "friend-delete") {
      const data = content as PipelineContent<"friend-delete">;
      values.friends.set(prev => prev.filter(f => f.id !== data.userId));
    }
  }

  useEffect(() => {
    const msg = vrc.pipeline?.lastMessage;
    if (!msg) return ;
    if (PipelineType.includes(msg.type as any)) {
      applyPipeMsgToStates(msg.type, msg.content as any);
    } else {
      console.log("Pipeline unknown message:", msg.type);
    }
  }, [vrc.pipeline?.lastMessage]);

  return (
    <Context.Provider value={{
      fetchAll,
      clearAll,
      ...values
    }}>
      {children}
    </Context.Provider>
  );
}

function initDataWrapper<T>(initialData: T, getter: ()=>Promise<T>): DataWrapper<T> {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fetch = async () => {
    setIsLoading(true);
    try {
      const newData = await getter();
      setData(newData);
      return newData;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const set = (v: React.SetStateAction<T>) => setData(v);
  const clear = () => setData(initialData);
  return { data, fetch, set, clear, isLoading };
}

export { DataProvider, useData };
