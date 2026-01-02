import { useEffect, useState, useRef } from "react";
import { events, commands, type Payload, type VrcLogEvent } from "./lib/bindings";
import QRCode from "react-qr-code";
import {
  enable as enableAutoStart,
  disable as disableAutoStart,
  isEnabled as isEnabledAutoStart
} from "@tauri-apps/plugin-autostart";

function App() {
  // --- State Definitions ---
  const [logs, setLogs] = useState<Payload[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Server & QR
  const [serverUrl, setServerUrl] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

  // Features
  const [autoStart, setAutoStart] = useState(false);

  // --- Effects ---

  useEffect(() => {
    // 1. サーバーURLを取得
    commands.getServerUrl().then((result) => {
      // SpectaのResult型 { status: "ok", data: ... } を想定
      if (result.status === "ok") {
        setServerUrl(result.data);
      }
    }).catch(console.error);

    // 2. 自動起動の状態を確認
    isEnabledAutoStart().then((enabled) => {
      setAutoStart(enabled);
    }).catch(console.error);

    // 3. ログイベントのリッスン
    const unlistenPromise = events.payload.listen((event) => {
      const newLog = event.payload;
      setLogs((prev) => [...prev, newLog]);
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // ログ更新時に自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // --- Handlers ---

  // 自動起動の切り替え
  const toggleAutoStart = async () => {
    try {
      if (autoStart) {
        await disableAutoStart();
        setAutoStart(false);
      } else {
        await enableAutoStart();
        setAutoStart(true);
      }
    } catch (e) {
      console.error("Failed to toggle auto-start:", e);
      alert("Failed to change auto-start setting.");
    }
  };


  // ログ内容の整形ヘルパー
  const getEventContent = (event: VrcLogEvent) => {
    switch (event.type) {
      case "AppStart":
        return { color: "text-green-500", text: "--- VRChat Started ---" };
      case "AppStop":
        return { color: "text-red-500", text: "--- VRChat Stopped ---" };
      case "Login":
        return {
          color: "text-blue-400",
          text: `Login: ${event.data.username} (ID: ${event.data.user_id})`
        };
      case "WorldEnter":
        return {
          color: "text-yellow-400",
          text: `Entered World: ${event.data.world_name}`
        };
      case "InstanceJoin":
        return {
          color: "text-orange-400",
          text: `Joined Instance: ${event.data.instance_id} (${event.data.world_id})`
        };
      case "PlayerJoin":
        return {
          color: "text-cyan-400",
          text: `[+] Join: ${event.data.player_name}`
        };
      case "PlayerLeft":
        return {
          color: "text-gray-400",
          text: `[-] Left: ${event.data.player_name}`
        };
      case "SelfLeft":
        return { color: "text-gray-500", text: "Left Room" };
      default:
        return { color: "text-white", text: JSON.stringify(event) };
    }
  };

  // --- Render ---

  return (
    <main className="p-4 h-screen w-screen flex flex-col bg-slate-900 text-white relative font-sans">

      {/* Header Area */}
      <header className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
        <h1 className="text-xl font-bold tracking-tight">VRChat Log Monitor</h1>

        <div className="flex items-center gap-3">
          {/* Auto Start Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer bg-slate-800 border border-slate-600 px-3 py-1.5 rounded hover:bg-slate-700 transition select-none">
            <input
              type="checkbox"
              checked={autoStart}
              onChange={toggleAutoStart}
              className="accent-blue-500 w-4 h-4 cursor-pointer"
            />
            <span className="text-sm font-medium">Auto Start</span>
          </label>

          {/* QR Button */}
          <button
            onClick={() => setShowQr(!showQr)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium transition shadow-lg shadow-blue-900/20"
          >
            {showQr ? "Hide QR" : "Mobile Connect"}
          </button>
        </div>
      </header>

      {/* QR Code Overlay */}
      {showQr && (
        <div className="absolute top-16 right-4 bg-white p-4 rounded-xl shadow-2xl z-50 text-slate-900 text-center animate-in fade-in zoom-in duration-200">
          <h3 className="font-bold mb-2 text-sm text-slate-600">Scan to Connect</h3>
          <div className="bg-white p-2 border rounded">
            {serverUrl ? (
              <QRCode value={serverUrl} size={150} />
            ) : (
              <div className="w-[150px] h-[150px] flex items-center justify-center text-gray-400 text-xs">
                Getting IP...
              </div>
            )}
          </div>
          <p className="text-[10px] mt-2 font-mono bg-slate-100 p-1 rounded text-slate-500 break-all max-w-[166px]">
            {serverUrl || "..."}
          </p>
        </div>
      )}

      {/* Logs Display Area */}
      <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-lg p-4 shadow-inner border border-slate-700/50 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <p>Waiting for VRChat logs...</p>
            <p className="text-xs mt-2 opacity-60">Launch VRChat or press "Import History"</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const { color, text } = getEventContent(log.event);
            return (
              <div key={index} className="flex mb-1 border-b border-slate-700/30 pb-1 last:border-0 hover:bg-slate-700/30 transition-colors">
                {/* Timestamp */}
                <span className="text-slate-500 mr-4 select-none w-36 shrink-0 text-xs py-0.5">
                  {log.timestamp}
                </span>

                {/* Event Type Badge */}
                <span className={`font-bold mr-3 w-28 shrink-0 text-xs py-0.5 uppercase tracking-wider ${color}`}>
                  {log.event.type}
                </span>

                {/* Message */}
                <span className="break-all text-slate-200">
                  {text}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer Status */}
      <div className="mt-3 flex justify-between items-center text-xs text-slate-500 px-1">
        <div className="flex gap-4">
          <span>Status: {logs.length > 0 ? "Monitoring" : "Idle"}</span>
          <span>Logs captured: {logs.length}</span>
        </div>
        <button
          onClick={() => setLogs([])}
          className="hover:text-red-400 transition-colors"
        >
          Clear Console
        </button>
      </div>
    </main>
  );
}

export default App;
