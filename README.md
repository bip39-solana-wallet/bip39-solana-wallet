# BIP39 Solana Wallet

[![Tests](https://github.com/bip39-solana-wallet/bip39-solana-wallet/actions/workflows/tests.yml/badge.svg)](https://github.com/bip39-solana-wallet/bip39-solana-wallet/actions/workflows/tests.yml)
[![Static Analysis](https://github.com/bip39-solana-wallet/bip39-solana-wallet/actions/workflows/static-analysis.yml/badge.svg)](https://github.com/bip39-solana-wallet/bip39-solana-wallet/actions/workflows/static-analysis.yml)
[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com/bip39-solana-wallet/bip39-solana-wallet/blob/main/LICENSE)

This **BIP39 Solana Wallet** is developed by [Stephen Damian](https://github.com/s-damian).

> A Desktop Solana Wallet developed in Rust 🦀

🚧 Status: Under development (the GUI has not yet been developed).

### Prerequisites

- **Rust** `>= 1.75.0` (last tested: `1.83.0`).
- **Cargo** (Rust's package manager).


### Roadmap

- ✅ Implemented command-line interface (CLI).
- ✅ Conducted testing: Functional and unit tests completed.
- ⬜ Development of graphical user interface (GUI) pending.
- ⬜ Pending addition of support for SPL tokens (JUP, ORCA, USDC, etc.).


## Feature Summary

| Functionality | Description | Command |
|---------------|-------------|---------|
| [Generate Mnemonic](#generate-mnemonic) | Creates a new mnemonic phrase (12 words, with an optional passphrase). | `generate_seed` |
| [Recover Keypair](#recover-keypair) | Recover keypair and seed from a mnemonic phrase. | `recover_seed <RECOVERY_PHRASE>` |
| [Send SOL (lamports)](#send-sol-lamports) | Send SOL to a recipient address (sign outgoing transaction). | `send <RECIPIENT_PUBKEY> <AMOUNT_IN_LAMPORTS>` |
| [Public Key Display](#get-public-key) | Retrieves and displays the public key from the locally stored keypair. | `pubkey` |
| [Get Balance](#get-balance-by-public-key) | Get balance (in SOL and in lamports) by public key. | `balance_by_pubkey <PUBKEY>` |


## Commands

### Generate Mnemonic

This command generates a new mnemonic phrase (12 words).

```bash
cargo run -- generate_seed
```

Example of result (without passphrase):

```bash
BIP39 Mnemonic (random phrase): mechanic spread manual soul flash above wrist weasel creek ill lazy tourist
Seed: 7AA0D8EFC50772C0A286AA17C695AE1927FF545ED924E47FDF72FCF0519BD601705BDEC50B42ECDFC4EE1E2237F875BD8BAAD1F4F62F5BC3187C9751985BD4C3
Solana Public Key: 7zjLEhEEazFnjoq13cQ3LABLhR69tXbJQqTBunBazEUP
```


### Recover Keypair

This command allows you to retrieve your seed (and therefore your private key) via a given mnemonic phrase.

```bash
cargo run -- recover_seed "mechanic spread manual soul flash above wrist weasel creek ill lazy tourist"
```

Example of result (without passphrase):

```bash
BIP39 Mnemonic (given phrase): mechanic spread manual soul flash above wrist weasel creek ill lazy tourist
Seed: 7AA0D8EFC50772C0A286AA17C695AE1927FF545ED924E47FDF72FCF0519BD601705BDEC50B42ECDFC4EE1E2237F875BD8BAAD1F4F62F5BC3187C9751985BD4C3
Solana Public Key: 7zjLEhEEazFnjoq13cQ3LABLhR69tXbJQqTBunBazEUP
```


### Send SOL (lamports)

This command allows you to send Lamports to a destination address.

```bash
cargo run -- send DXGaLHJ2w4Q4Jer5gH6qcscKdjNpP8gPadjdRY7Tm3D2 2000000
```

PS: 2000000 Lamports = 0.002 SOL.

Example of result:

```bash
Transaction sent successfully!
```


### Get Public Key

This command allows you to view your Solana public key if you have already stored your keypair locally.

```bash
cargo run -- pubkey
```

Example of result:

```bash
Solana Public Key: 7zjLEhEEazFnjoq13cQ3LABLhR69tXbJQqTBunBazEUP
```


### Get Balance by Public Key

This command allows you to see the balance of a public address.

```bash
cargo run -- balance_by_pubkey 7zjLEhEEazFnjoq13cQ3LABLhR69tXbJQqTBunBazEUP
```

Example of result:

```bash
Balance: 0.010000000 SOL (10000000 lamports)
```


## Solscan For This Test

[Phantom](https://solscan.io/account/DXGaLHJ2w4Q4Jer5gH6qcscKdjNpP8gPadjdRY7Tm3D2)

[BIP39 Solana Wallet](https://solscan.io/account/7zjLEhEEazFnjoq13cQ3LABLhR69tXbJQqTBunBazEUP)
