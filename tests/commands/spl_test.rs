#[cfg(test)]
mod tests {
    use std::env;
    use solana_client::rpc_client::RpcClient;
    use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
    use rust_solana_wallet::solana::spl_token::SolanaSplToken;

    // Test for sending SPL tokens in TEST_MODE (simulated transaction)
    #[test]
    fn test_send_spl_tokens_in_test_mode() {
        // Enable TEST_MODE simulation
        env::set_var("TEST_MODE", "true");

        println!("Simulating sending SPL tokens in TEST_MODE");

        let sender_keypair = Keypair::new();
        let recipient_pubkey = Pubkey::new_unique();
        let token_address = Pubkey::new_unique();
        let amount = 1000;

        // Simulate the transaction logic without hitting the network
        let result = SolanaSplToken::send_spl_tokens(
            "http://127.0.0.1:8899",  // Test RPC URL
            &sender_keypair,
            &recipient_pubkey,
            &token_address,
            amount,
        );

        // Check that the result is Ok (no errors occurred)
        assert!(result.is_ok());
    }

    #[test]
    fn test_send_spl_tokens_real_transaction() {
        // Disable TEST_MODE simulation (real network interaction)
        env::set_var("TEST_MODE", "false");

        let rpc_url = "http://127.0.0.1:8899"; // Ensure the Solana Test Validator is running

        let sender_keypair = Keypair::new();
        let recipient_pubkey = Pubkey::new_unique();
        let token_address = Pubkey::new_unique();
        let amount = 1000;

        // Airdrop some SOL to the sender account to pay for transaction fees
        let client = RpcClient::new(rpc_url.to_string());
        match client.request_airdrop(&sender_keypair.pubkey(), 1_000_000_000) {
            Ok(_) => println!("Airdrop successful!"),
            Err(e) => panic!("Airdrop failed: {:?}", e),
        }

        // Call the function and interact with the real testnet
        let result = SolanaSplToken::send_spl_tokens(
            rpc_url,
            &sender_keypair,
            &recipient_pubkey,
            &token_address,
            amount,
        );

        // Log the error if result is Err
        if let Err(e) = &result {
            println!("Error occurred while sending SPL tokens: {:?}", e);
        }

        // Check that the result is Ok (no errors occurred)
        assert!(result.is_ok());
    }
}