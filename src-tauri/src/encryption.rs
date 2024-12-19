use std::fs::File;
use std::io::{Read, Write};

use orion::hazardous::{
  aead::xchacha20poly1305::{open, seal, Nonce, SecretKey},
  mac::poly1305::POLY1305_OUTSIZE,
  stream::xchacha20::XCHACHA_NONCESIZE,
};

use orion::hazardous::stream::chacha20::CHACHA_KEYSIZE;
use orion::kdf::{derive_key, Password, Salt};
use rand_core::{OsRng, RngCore};

fn get_random(dest: &mut [u8]) {
  RngCore::fill_bytes(&mut OsRng, dest);
}

fn nonce() -> Vec<u8> {
  let mut randoms: [u8; 24] = [0; 24];
  get_random(&mut randoms);
  return randoms.to_vec();
}

fn auth_tag() -> Vec<u8> {
  let mut randoms: [u8; 32] = [0; 32];
  get_random(&mut randoms);
  return randoms.to_vec();
}

fn simple_split_encrypted(cipher_text: &[u8]) -> (Vec<u8>, Vec<u8>) {
  return (
    cipher_text[..CHACHA_KEYSIZE].to_vec(),
    cipher_text[CHACHA_KEYSIZE..].to_vec(),
  );
}

fn create_key(password: String, nonce: Vec<u8>) -> Result<SecretKey, &'static str> {
  let password =
    Password::from_slice(password.as_bytes()).map_err(|_| "Couldn't get password from bytes!")?;
  let salt = Salt::from_slice(nonce.as_slice()).map_err(|_| "Couldn't get salt from nonce!")?;
  let kdf_key = derive_key(&password, &salt, 15, 1024, CHACHA_KEYSIZE as u32)
    .map_err(|_| "Couldn't get KDF key!")?;
  let key = SecretKey::from_slice(kdf_key.unprotected_as_bytes())
    .map_err(|_| "Couldn't get secret key!")?;
  return Ok(key);
}

fn encrypt_core(
  dist: &mut File,
  contents: Vec<u8>,
  key: &SecretKey,
  nonce: Nonce,
) -> Result<(), &'static str> {
  let ad = auth_tag();
  let output_len = match contents.len().checked_add(POLY1305_OUTSIZE + ad.len()) {
    Some(min_output_len) => min_output_len,
    None => panic!("Plaintext is too long"),
  };

  let mut output = vec![0u8; output_len];
  output[..CHACHA_KEYSIZE].copy_from_slice(ad.as_ref());
  seal(
    &key,
    &nonce,
    contents.as_slice(),
    Some(ad.clone().as_slice()),
    &mut output[CHACHA_KEYSIZE..],
  )
  .map_err(|_| "Couldn't open while encrypting!")?;

  dist
    .write(&output.as_slice())
    .map_err(|_| "Couldn't write while encrypting!")?;

  return Ok(());
}

fn decrypt_core<W: Write>(
  dist: &mut W,
  contents: Vec<u8>,
  key: &SecretKey,
  nonce: Nonce,
) -> Result<(), &'static str> {
  let split = simple_split_encrypted(contents.as_slice());
  let mut output = vec![0u8; split.1.len() - POLY1305_OUTSIZE];

  open(
    &key,
    &nonce,
    split.1.as_slice(),
    Some(split.0.as_slice()),
    &mut output,
  )
  .map_err(|_| "Couldn't open while decrypting!")?;

  dist
    .write(&output.as_slice())
    .map_err(|_| "Couldn't write while decrypting!")?;

  return Ok(());
}

const CHUNK_SIZE: usize = 128; // The size of the chunks you wish to split the stream into.

pub fn encrypt(file_path: &str, src: &Vec<u8>, password: String) -> Result<(), &'static str> {
  let mut dist = File::create(file_path).expect("Failed to create output file");

  let nonce = nonce();

  dist
    .write(nonce.as_slice())
    .map_err(|_| "Couldn't write nonce during encryption!")?;
  let key = create_key(password, nonce.clone())?;
  let nonce = Nonce::from_slice(nonce.as_slice())
    .map_err(|_| "Couldn't get nonce from slice during encryption!")?;

  for src_chunk in src.chunks(CHUNK_SIZE) {
    encrypt_core(&mut dist, src_chunk.to_vec(), &key, nonce)?
  }

  Ok(())
}

pub fn decrypt(
  file_path: &str,
  output: &mut Vec<u8>,
  password: String,
) -> Result<(), &'static str> {
  let mut input_file = File::open(file_path).expect("Failed to open input file");

  let mut src: Vec<u8> = Vec::new();
  input_file
    .read_to_end(&mut src)
    .expect("Failed to read input file");

  let nonce = src[..XCHACHA_NONCESIZE].to_vec();

  src = src[XCHACHA_NONCESIZE..].to_vec();

  let key = create_key(password, nonce.clone())?;
  let nonce = Nonce::from_slice(nonce.as_slice())
    .map_err(|_| "Couldn't get nonce from slice during decryption!")?;

  for src_chunk in src.chunks(CHUNK_SIZE + CHACHA_KEYSIZE + POLY1305_OUTSIZE) {
    decrypt_core(output, src_chunk.to_vec(), &key, nonce)?;
  }

  Ok(())
}
