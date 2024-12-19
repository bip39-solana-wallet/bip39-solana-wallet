use state::UserInfo;
use std::{fs, sync::Mutex};
use tauri::Manager;

pub mod commands;
mod encryption;
mod solana;
pub mod state;

pub const KEY_FILE_PATH: &'static str = "./keypair-id.enc";
pub const RPC_URL: &'static str = "https://api.devnet.solana.com";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let user_info = get_starting_user_info();

  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .setup(|app| {
      #[cfg(debug_assertions)]
      app.get_webview_window("main").unwrap().open_devtools(); // `main` is the first window from tauri.conf.json without an explicit label
      Ok(())
    })
    .manage(Mutex::new(state::State::new(user_info)))
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri_types::generate_invoke![
      commands::get_user_info,
      commands::generate_words,
      commands::generate_wallet,
      commands::unlock_wallet,
      commands::refresh_user,
      commands::send_sol,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn get_starting_user_info() -> UserInfo {
  match fs::exists(KEY_FILE_PATH) {
    Ok(true) => return state::UserInfo::Locked,
    Ok(false) => return state::UserInfo::None,
    Err(_) => return state::UserInfo::Unavailable,
  };
}
