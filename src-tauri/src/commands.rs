use crate::state::{State, UserInfo};
use solana_sdk::signer::Signer;
use std::sync::Mutex;

#[tauri::command]
#[tauri_types::command]
pub fn get_user_info(state: tauri::State<'_, Mutex<State>>) -> UserInfo {
  return state.lock().unwrap().user_info.clone();
}

#[tauri::command]
#[tauri_types::command]
pub fn generate_words() -> Vec<String> {
  return crate::solana::mnemonic::generate_mnemonic()
    .split(" ")
    .map(|str| str.to_string())
    .collect::<Vec<String>>();
}

#[tauri::command]
#[tauri_types::command]
pub fn generate_wallet(
  state: tauri::State<'_, Mutex<State>>,
  words: Vec<String>,
  password: String,
) -> Option<UserInfo> {
  let mut state = state.lock().unwrap();
  let public_key = match crate::solana::wallet::generate_wallet(&words, password) {
    Ok(public_key) => public_key,
    Err(_) => return None,
  };

  let balance = match crate::solana::wallet::get_balance_by_pubkey(public_key.as_str()) {
    Ok(balance) => balance,
    Err(_) => 0,
  };

  state.user_info = UserInfo::Unlocked {
    public_key,
    balance,
    balance_readable: (balance as f64) / LAMPORT_IN_SOL,
  };

  return Some(state.user_info.clone());
}

#[tauri::command]
#[tauri_types::command]
pub fn unlock_wallet(state: tauri::State<'_, Mutex<State>>, password: String) -> Option<UserInfo> {
  let mut state = state.lock().unwrap();
  let keypair = match crate::solana::wallet::load_wallet(password) {
    Ok(kp) => kp,
    Err(_) => return None,
  };

  let balance = match crate::solana::wallet::get_balance_by_pubkey(keypair.pubkey()) {
    Ok(balance) => balance,
    Err(_) => 0,
  };

  state.user_info = UserInfo::Unlocked {
    public_key: keypair.pubkey().to_string(),
    balance,
    balance_readable: (balance as f64) / LAMPORT_IN_SOL,
  };
  state.keypair = Some(keypair);

  return Some(state.user_info.clone());
}

#[tauri::command]
#[tauri_types::command]
pub fn refresh_user(state: tauri::State<'_, Mutex<State>>) -> Option<UserInfo> {
  let mut state = state.lock().unwrap();
  let keypair = match &state.keypair {
    Some(kp) => kp,
    None => return None,
  };

  let balance = match crate::solana::wallet::get_balance_by_pubkey(keypair.pubkey()) {
    Ok(balance) => balance,
    Err(_) => 0,
  };

  state.user_info = UserInfo::Unlocked {
    public_key: keypair.pubkey().to_string(),
    balance,
    balance_readable: (balance as f64) / LAMPORT_IN_SOL,
  };

  return Some(state.user_info.clone());
}

#[tauri::command]
#[tauri_types::command]
pub async fn send_sol(
  state: tauri::State<'_, Mutex<State>>,
  address: String,
  amount: f64,
) -> Result<UserInfo, String> {
  let keypair = match &state.lock().unwrap().keypair {
    Some(kp) => kp.insecure_clone(),
    None => return Err("Couldn't get keypair!".to_string()),
  };

  match crate::solana::transaction::send_lamports(
    &keypair,
    address.as_str(),
    (amount * LAMPORT_IN_SOL) as u64,
  )
  .await
  {
    Ok(res) => res,
    Err(e) => return Err(e.to_string()),
  };

  let mut state = state.lock().unwrap();

  let balance = match crate::solana::wallet::get_balance_by_pubkey(keypair.pubkey()) {
    Ok(balance) => balance,
    Err(_) => 0,
  };

  state.user_info = UserInfo::Unlocked {
    public_key: keypair.pubkey().to_string(),
    balance,
    balance_readable: (balance as f64) / LAMPORT_IN_SOL,
  };

  return Ok(state.user_info.clone());
}

const LAMPORT_IN_SOL: f64 = 1_000_000_000f64;
