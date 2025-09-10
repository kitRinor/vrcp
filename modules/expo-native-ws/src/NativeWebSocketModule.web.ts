import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './NativeWebSocket.types';

type NativeWebSocketModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class NativeWebSocketModule extends NativeModule<NativeWebSocketModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(NativeWebSocketModule, 'NativeWebSocketModule');
