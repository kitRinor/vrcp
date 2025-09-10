import { NativeModule, requireNativeModule } from 'expo';

import { NativeWebSocketModuleEvents } from './NativeWebSocket.types';

declare class NativeWebSocketModule extends NativeModule<NativeWebSocketModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<NativeWebSocketModule>('NativeWebSocket');
