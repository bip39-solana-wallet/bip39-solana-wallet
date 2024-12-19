use serde::Serialize;
use solana_sdk::signature::Keypair;

#[derive(tauri_types::TauriType, Clone, Serialize)]
pub enum UserInfo {
  None,
  Locked,
  Unlocked {
    public_key: String,
    balance: u64,
    balance_readable: f64,
  },
  Unavailable,
  Invalid,
}

// #[derive(Manager)]
pub struct State {
  pub user_info: UserInfo,
  pub keypair: Option<Keypair>,
}

impl State {
  pub fn new(user_info: UserInfo) -> State {
    return State {
      user_info,
      keypair: None,
    };
  }
}
