import { push, replace } from "expo-router/build/global-state/routing";


export const routeToIndex = () => replace("/"); // use replace to avoid going back to login screen
export const routeToHome = () => replace("/maintabs/home"); // use replace to avoid going back to login screen

export const routeToSearch = (search?:string) => {
  const q = []; 
  if (search) q.push(`search=${search}`);
  push(`/subscreens/search?${q.join("&")}`);
};
export const routeToFavorites = () => push(`/subscreens/favorites`);
export const routeToResources = () => push(`/subscreens/resources`);
export const routeToFriendLocations = () => push(`/subscreens/friendlocations`);
export const routeToEvents = () => push(`/subscreens/events`);
export const routeToFeeds = () => push(`/subscreens/feeds`);
export const routeToNotifications = () => push(`/subscreens/notifications`);

export const routeToUser = (id:string) => push(`/subscreens/user/${id}`);
export const routeToWorld = (id:string) => push(`/subscreens/world/${id}`);
export const routeToAvatar = (id:string) => push(`/subscreens/avatar/${id}`);
export const routeToGroup = (id:string) => push(`/subscreens/group/${id}`);
export const routeToInstance = (wrldId:string, instId: string) => push(`/subscreens/instance/${wrldId}:${instId}`);