use super::seed::BipSeed;
use crate::encryption::{decrypt, encrypt};
use bip39::{Language, Mnemonic};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
  pubkey::Pubkey,
  signature::{keypair_from_seed, write_keypair, Keypair},
  signer::Signer,
};

pub fn generate_wallet(words: &Vec<String>, password: String) -> Result<String, &'static str> {
  let mnemonic = Mnemonic::from_phrase(&words.join(" "), Language::English)
    .map_err(|_| "Couldn't convert words to Mnemonic!")?;
  let seed = BipSeed::generate_seed(&mnemonic, "");

  let seed_bytes = BipSeed::get_seed_bytes(&seed);

  let derived_seed_bytes =
    BipSeed::derive_seed_bytes(seed_bytes, 0).map_err(|_| "Couldn't derive seed bytes!")?;
  let keypair =
    keypair_from_seed(&derived_seed_bytes).map_err(|_| "Failed to generate keypair to file!")?;

  let public_key = keypair.pubkey().to_string();

  let mut data = vec![];
  write_keypair(&keypair, &mut data).map_err(|_| "Failed to write keypair!")?;

  encrypt(&crate::KEY_FILE_PATH, &data, password)
    .map_err(|_| "Failed to encrypt & write keypair to file!")?;

  return Ok(public_key);
}

pub fn load_wallet(password: String) -> Result<Keypair, &'static str> {
  match std::fs::exists(crate::KEY_FILE_PATH) {
    Ok(true) => {}
    Ok(false) => return Err("Key file does NOT exist!")?,
    Err(_) => return Err("There was an error checking the key file!")?,
  };

  let mut data = vec![];
  decrypt(&crate::KEY_FILE_PATH, &mut data, password).map_err(|_| "Couldn't decrypt key file!")?;
  let content = String::from_utf8(data).map_err(|_| "Couldn't decypher key file!")?;

  let cleaned_content = content.trim_matches(|c: char| c == '[' || c == ']' || c.is_whitespace());
  let bytes: Result<Vec<u8>, _> = cleaned_content
    .split(',')
    .map(|s| s.trim().parse::<u8>())
    .collect();

  let bytes = bytes.map_err(|_| "Couldn't parse bytes!")?;
  return Ok(Keypair::from_bytes(&bytes).map_err(|_| "Couldn't get keypair from bytes")?);
}

pub fn get_balance_by_pubkey<P>(pubkey: P) -> Result<u64, &'static str>
where
  Pubkey: TryFrom<P>,
{
  let pubkey = Pubkey::try_from(pubkey).map_err(|_| "Couldn't parse public key!")?;
  let client = RpcClient::new(&crate::RPC_URL);
  return Ok(
    client
      .get_balance(&pubkey)
      .map_err(|_| "Error getting the balance!")?,
  );
}
