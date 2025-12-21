import { useEffect, useState, useRef } from "react";
import { commands, events, type LogEntry } from "./lib/bindings";
import { isTauri } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const init = async () => {
      if (isTauri()) {
        try {
          // 1. 【Pull】 過去ログの同期
          console.log("Syncing past logs...");
          const pastLogs = await commands.syncLogs(0); // 0 : 全ログを取得
          setLogs(pastLogs.reverse().slice(0, 50)); // 最新100件だけ表示
          console.log(`Synced ${pastLogs.length} logs.`);
          // 2. 【Push】 リアルタイム更新の監視
          const eventPromise = events.logUpdateEvent.listen((event) => {
            const newEntries = event.payload;
            console.log(`Received new logs:\n ${newEntries.map(e => e.timestamp).join('\n')}`);
            setLogs((prevLogs) => [...newEntries.reverse(), ...prevLogs].slice(0, 50));
          });

          unlisten = await eventPromise;
        } catch (err) {
          console.error("Failed to initialize log watcher:", err);
        }
      } else {
        console.warn("Not running in Tauri environment. Log monitoring with dummy data.");
        setLogs([
          { timestamp: "2024-01-01 12:00:00", log_type: "PlayerJoined", content: "usr_00000000-0000-0000-0000-000000000000" },
          { timestamp: "2024-01-01 12:01:00", log_type: "PlayerLeft", content: "usr_00000000-0000-0000-0000-000000000000" },
          { timestamp: "2024-01-01 12:02:00", log_type: "Joining", content: "wrld_00000000-0000-0000-0000-000000000000:99999~private(usr_00000000-0000-0000-0000-000000000000)~canRequestInvite~region(jp)" },
        ].reverse());
        const genRand16 = (n:number) => Math.random().toString(16).slice(2, 2 + n);
        const genUUID = () => `${genRand16(8)}-${genRand16(4)}-${genRand16(4)}-${genRand16(4)}-${genRand16(12)}`;
        const interval = setInterval(() => {
          if (Math.random() < 0.3) return;
          const count = Math.floor(Math.random() * 3) + 1
          const newLogs: LogEntry[] = []
          for (let i = 0; i < count; i++) {
            const now = new Date();
            const type = ["PlayerJoined", "PlayerLeft", "Joining"][Math.floor(Math.random() * 3)]
            const newLog: LogEntry = {
              timestamp: now.toISOString().replace('T', ' ').split('.')[0],
              log_type: type, 
              content: type === "Joining" 
                ? `wrld_${genUUID()}:${Math.random().toString(10).slice(2,7)}~private(usr_${genUUID()})~canRequestInvite~region(jp)` 
                : `usr_${genUUID()}`
            };
            newLogs.push(newLog);
          }
          setLogs((prevLogs) => [...newLogs.reverse(), ...prevLogs].slice(0,50));
        }, 3000);
        unlisten = () => clearInterval(interval);
      }
    }

    init();

    // クリーンアップ関数
    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  // ログタイプごとの色分け
  const getLogColor = (type: string) => {
    if (type.includes("Warning")) return "text-yellow-400";
    if (type.includes("Error")) return "text-red-400";
    if (type.includes("Exception")) return "text-red-500 font-bold";
    return "text-gray-300"; // Default
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-mono text-sm">
      <header className="mb-4 border-b border-gray-700 pb-2 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-400">VRChat Log Monitor</h1>
        <span className="text-gray-500 text-xs">{logs.length} lines</span>
      </header>

      <div className="space-y-1 overflow-auto max-h-[90vh]">
        {logs.length === 0 ? (
          <div className="text-gray-500 italic">Waiting for logs...</div>
        ) : (
          <AnimatePresence initial={false}>
          {logs.map((log, index) => (
            <motion.div 
              key={`${log.timestamp}-${log.content}`} 
              className="flex gap-2 hover:bg-gray-800 p-1 rounded"
              layout // 押し下げるアニメーション
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
            >
              {/* 日時 */}
              <span className="text-gray-500 whitespace-nowrap shrink-0 select-none">
                [{log.timestamp.split(' ')[1]}] {/* 時間だけ表示 */}
              </span>
              
              {/* ログタイプ */}
              <span className={`w-28 shrink-0 ${getLogColor(log.log_type)}`}>
                {log.log_type}
              </span>
              
              {/* 内容 */}
              <span className="break-all whitespace-pre-wrap text-gray-200">
                {log.content}
              </span>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
        {/* 自動スクロールのアンカー */}
      </div>
    </div>
  );
}

export default App;