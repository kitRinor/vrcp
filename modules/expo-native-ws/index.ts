// Reexport the native module. On web, it will be resolved to NativeWebSocketModule.web.ts
// and on native platforms to NativeWebSocketModule.ts
export { default } from './src/NativeWebSocketModule';
export { default as NativeWebSocketView } from './src/NativeWebSocketView';
export * from  './src/NativeWebSocket.types';
