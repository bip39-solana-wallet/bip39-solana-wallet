use std::env;
use std::error::Error;
use solana_client::rpc_request::TokenAccountsFilter;
use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
use spl_associated_token_account::{get_associated_token_address, instruction::create_associated_token_account};
use std::str::FromStr;

pub struct SolanaSplToken {}

impl SolanaSplToken {
    pub fn send_spl_tokens(
        rpc_url: &str,
        sender_keypair: &Keypair,
        recipient_pubkey: &Pubkey,
        token_address: &Pubkey,
        amount: u64,
    ) -> Result<(), Box<dyn Error>> {
        if env::var("TEST_MODE").unwrap_or_default() == "true" {
            println!(
                "Simulating sending {} SPL tokens from {} to {} (Token Address: {})",
                amount,
                sender_keypair.pubkey(),
                recipient_pubkey,
                token_address
            );
            Ok(())
        } else {
            let client = solana_client::rpc_client::RpcClient::new(rpc_url.to_string());
            let recent_blockhash = client.get_latest_blockhash()?; // Retrieve the most recent blockhash

            // Ensure both sender and recipient have token accounts
            let sender_token_account = SolanaSplToken::get_or_create_token_account(&client, &sender_keypair.pubkey(), token_address, sender_keypair)?;
            let recipient_token_account = SolanaSplToken::get_or_create_token_account(&client, &recipient_pubkey, token_address, sender_keypair)?;

            // Create the transfer instruction
            let ix = spl_token::instruction::transfer(
                &spl_token::id(),
                &sender_token_account,
                &recipient_token_account,
                &sender_keypair.pubkey(),
                &[],
                amount,
            )?;

            // Create the transaction
            let transaction = solana_sdk::transaction::Transaction::new_signed_with_payer(
                &[ix],
                Some(&sender_keypair.pubkey()),
                &[sender_keypair], // Use sender_keypair for signing
                recent_blockhash,
            );

            client.send_and_confirm_transaction(&transaction)?;
            Ok(())
        }
    }

    fn get_or_create_token_account(
        client: &solana_client::rpc_client::RpcClient,
        payer_pubkey: &Pubkey,
        token_address: &Pubkey,
        sender_keypair: &Keypair, // Only sender's Keypair is needed for signing transactions
    ) -> Result<Pubkey, Box<dyn Error>> {
        // Get the associated token account address for the payer
        let associated_token_account = get_associated_token_address(payer_pubkey, token_address);

        // Check if the token account already exists
        let token_accounts = client.get_token_accounts_by_owner(
            payer_pubkey,
            TokenAccountsFilter::Mint(*token_address),
        )?;

        // If the associated token account already exists, return its pubkey
        for account in token_accounts.iter() {
            let account_pubkey = Pubkey::from_str(&account.pubkey)?; // Convert the String to Pubkey
            if account_pubkey == associated_token_account {
                return Ok(account_pubkey);  // Return existing associated token account's pubkey
            }
        }

        // If the associated token account doesn't exist, create one
        let create_account_ix = create_associated_token_account(
            payer_pubkey,
            payer_pubkey,  // The payer is both the owner and the creator of the token account
            &associated_token_account,
            &spl_associated_token_account::id(), // Program ID
        );

        // Create a transaction to send the create account instruction
        let recent_blockhash = client.get_latest_blockhash()?;
        let transaction = solana_sdk::transaction::Transaction::new_signed_with_payer(
            &[create_account_ix],
            Some(payer_pubkey), // Payer is the sender
            &[sender_keypair],   // Keypair for signing the transaction
            recent_blockhash,
        );
        client.send_and_confirm_transaction(&transaction)?;
        Ok(associated_token_account)
    }
}
