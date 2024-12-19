use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::{
  message::Message,
  pubkey::Pubkey,
  signature::{Keypair, Signer},
  system_instruction,
  transaction::Transaction,
};

/// Envoyer des SOL à une adresse spécifique.
///
/// # Arguments:
/// - sender_keypair - La paire de clés du compte expéditeur utilisée pour signer la transaction.
/// - recipient_pubkey - La clé publique du destinataire qui recevra les SOL.
/// - lamports - Le montant en lamports à envoyer (1 SOL = 1_000_000_000 lamports).
///
/// # Returns:
/// Retourne un "Result" qui est Ok si la transaction est réussie, ou une erreur en cas d'échec.
pub async fn send_lamports<P>(
  sender_keypair: &Keypair,
  recipient_pubkey: P,
  lamports: u64,
) -> Result<(), &'static str>
where
  Pubkey: TryFrom<P>,
{
  let recipient_pubkey = recipient_pubkey
    .try_into()
    .map_err(|_| "Couldn't convert into Pubkey!")?;
  // Envoi réel de la transaction via le réseau Solana :

  // Crée un client pour interagir avec le réseau Solana via RPC.
  let client = RpcClient::new(crate::RPC_URL.to_string());

  // Récupère le dernier blockhash utilisé comme référence de frais pour la transaction.
  let recent_blockhash = client
    .get_latest_blockhash()
    .await
    .map_err(|_| "Couldn't get latest blockhash!")?;

  // Crée une instruction pour transférer des lamports du compte expéditeur au destinataire.
  let instruction =
    system_instruction::transfer(&sender_keypair.pubkey(), &recipient_pubkey, lamports);

  // Emballe l'instruction dans un message, en spécifiant le compte expéditeur comme compte de frais.
  let message = Message::new(&[instruction], Some(&sender_keypair.pubkey()));

  // Crée la transaction en utilisant la paire de clés de l'expéditeur, le message et le blockhash récent.
  // La transaction est automatiquement signée par la paire de clés de l'expéditeur lors de la création.
  let transaction = Transaction::new(&[sender_keypair], message, recent_blockhash);

  // Envoie la transaction signée au réseau Solana et attend la confirmation.
  client
    .send_and_confirm_transaction(&transaction)
    .await
    .map_err(|_| "Couldn't send and confirm transaction!")?;

  // Retourne Ok si tout s'est bien passé.
  Ok(())
}
