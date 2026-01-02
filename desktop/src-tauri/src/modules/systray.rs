use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, Window, WindowEvent,
};

/// タスクトレイのセットアップ
/// (アイコン表示、メニュー作成、クリックイベントの登録)
pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    // 1. メニュー項目の作成
    let quit_i = MenuItem::with_id(app, "quit", "Quit VRCP", true, None::<&str>)?;
    let show_i = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

    // 2. アイコン画像の読み込み
    // modulesフォルダ内にあるため、iconsフォルダへは ../../ でアクセス
    let icon = Image::from_bytes(include_bytes!("../../icons/32x32.png"))?;

    // 3. トレイアイコンのビルド
    let _tray = TrayIconBuilder::new()
        .icon(icon)
        .menu(&menu)
        .show_menu_on_left_click(false) // 左クリックはメニューではなくウィンドウ表示トグル
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "quit" => {
                    // 本当に終了する
                    app.exit(0);
                }
                "show" => {
                    // ウィンドウを表示
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            // トレイアイコンをクリックした時の動作
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    if window.is_visible().unwrap_or(false) {
                        let _ = window.hide();
                    } else {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

/// ウィンドウイベントのハンドリング
/// (×ボタンでアプリを終了させず、隠す処理)
pub fn handle_window_event(window: &Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        // no-kill, hide
        window.hide().unwrap();
        api.prevent_close();
    }
}
