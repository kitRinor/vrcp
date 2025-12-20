// モジュール宣言 (modulesフォルダを読み込む)
mod modules;

use std::sync::Mutex;
use std::time::Duration;
use tauri::{AppHandle, Manager};
use tauri_specta::{collect_commands, collect_events, Builder as SpectaBuilder};
use modules::watcher::{LogManager, LogEntry, LogUpdateEvent};
use tauri_specta::Event;

// アプリ全体で共有する状態
struct AppState {
    // WatcherクラスをMutexで保護（スレッドセーフにする）
    log_manager: Mutex<LogManager>,
}

// ---------------------------------------------------------
// コマンド定義
// ---------------------------------------------------------

/// 指定時刻以降のログを過去ファイル含めて取得
#[tauri::command]
#[specta::specta] // TypeScript型定義用
fn sync_logs(state: tauri::State<AppState>, since_timestamp: i64) -> Vec<LogEntry> {
    // ロックを取得して処理を実行
    let manager = state.log_manager.lock().unwrap();
    manager.get_logs_since(since_timestamp)
}

// ---------------------------------------------------------
// バックグラウンド処理
// ---------------------------------------------------------

fn start_log_watcher(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        loop {
            // ブロックを作ることで、ロックの保持期間を最小限にする
            let new_logs = {
                let state = app.state::<AppState>();
                // ここでロック取得（一瞬だけ）
                let mut manager = state.log_manager.lock().unwrap();
                manager.check_recent_updates()
                // ここでロック解除
            };

            // 新しいログがあればイベント発火
            if !new_logs.is_empty() {
                println!("Found {} new log lines", new_logs.len()); // デバッグ用
                
                // 型安全なイベント送信 (LogUpdateEvent構造体を使用)
                // フロントエンド側は events.logUpdate.listen で受信
                let _ = LogUpdateEvent(new_logs).emit(&app); 
            }

            // 3秒待機 (間隔は好みで調整)
            tokio::time::sleep(Duration::from_secs(3)).await;
        }
    });
}

// ---------------------------------------------------------
// Specta Builder (型定義生成用)
// ---------------------------------------------------------

// gen_bindings.rs からも呼び出せるように pub にする
pub fn create_specta_builder() -> SpectaBuilder {
    SpectaBuilder::new()
        .commands(collect_commands![
            sync_logs // コマンドを登録
        ])
        .events(collect_events![
            LogUpdateEvent // イベントを登録
        ])
}

// ---------------------------------------------------------
// エントリーポイント
// ---------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = create_specta_builder();

    tauri::Builder::default()
        // Stateの初期化
        .manage(AppState {
            log_manager: Mutex::new(LogManager::new()),
        })
        // プラグイン
        .plugin(tauri_plugin_opener::init())
        // Specta (bindings.ts生成用) の接続
        .invoke_handler(builder.invoke_handler())
        .setup(move |app| {
            // イベントリスナーの登録（Specta用）
            builder.mount_events(app);

            // 監視タスクの開始
            start_log_watcher(app.handle().clone());
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}