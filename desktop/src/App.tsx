import { useEffect, useState, useRef } from "react";
import { events, type Payload } from "./lib/bindings"; // 生成されたファイルをインポート

function App() {
  // ログのリストを保持するState
  const [logs, setLogs] = useState<Payload[]>([]);

  // 自動スクロール用のRef
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Rustからのイベント "payload" をリッスン
    // bindings.ts で定義された型安全なリスナー
    const unlistenPromise = events.payload.listen((event) => {
      // event.payload に Rust側の Payload 構造体が入っている
      const newLog = event.payload;

      console.log("New Log:", newLog);

      setLogs((prevLogs) => [...prevLogs, newLog]);
    });

    // クリーンアップ関数（コンポーネントのアンマウント時にリスナー解除）
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  // ログが追加されたら自動で一番下へスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // イベントの種類ごとに表示メッセージと色を分けるヘルパー関数
  const getEventContent = (log: Payload) => {
    const { event } = log;

    switch (event.type) {
      case "AppStart":
        return { color: "text-green-500", text: "VRChat Started" };
      case "AppStop":
        return { color: "text-red-500", text: "VRChat Stopped" };
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
          text: `Joined Instance: ${event.data.instance_id}`
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
        return { color: "text-white", text: "Unknown Event" };
    }
  };

  return (
    <main className="container mx-auto p-4 h-screen flex flex-col bg-slate-900 text-white">
      <h1 className="text-2xl font-bold mb-4 border-b border-slate-700 pb-2">
        VRChat Log Monitor
      </h1>

      {/* ログ表示エリア */}
      <div className="flex-1 overflow-y-auto bg-slate-800 rounded-md p-4 shadow-inner font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Waiting for logs...</p>
        ) : (
          logs.map((log, index) => {
            const { color, text } = getEventContent(log);
            return (
              <div key={index} className="mb-1 flex border-b border-slate-700/50 pb-1 last:border-0">
                {/* タイムスタンプ */}
                <span className="text-gray-500 mr-4 select-none w-36 shrink-0">
                  {log.timestamp}
                </span>

                {/* イベントタイプバッジ (オプション) */}
                <span className={`font-bold mr-2 w-24 shrink-0 ${color}`}>
                  [{log.event.type}]
                </span>

                {/* 詳細メッセージ */}
                <span className="break-all">
                  {text}
                </span>
              </div>
            );
          })
        )}
        {/* 自動スクロール用のダミー要素 */}
        <div ref={bottomRef} />
      </div>

      {/* フッター操作エリア */}
      <div className="mt-4 flex justify-between">
        <span className="text-xs text-gray-500">
          Listening for events... ({logs.length} logs captured)
        </span>
        <button
          onClick={() => setLogs([])}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition"
        >
          Clear Logs
        </button>
      </div>
    </main>
  );
}

export default App;
