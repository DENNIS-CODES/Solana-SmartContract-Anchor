import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TokenContract } from "../target/types/token_contract"; //(anchor build後會存在token-contract/target/types/token_contract.ts)
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
} from "@solana/spl-token"; 
import { assert } from "chai";

describe("token-contract", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  // Retrieve the TokenContract struct from our smart contract
  const program = anchor.workspace.TokenContract as Program<TokenContract>;
  // Generate a random keypair that will represent our token
  const mintKey: anchor.web3.Keypair = anchor.web3.Keypair.generate();
  // AssociatedTokenAccount for anchor's workspace wallet
  let associatedTokenAccount = undefined;

  // 每個it都是會被執行的test
  // 這邊是mint token的test
  it("Mint a token", async () => {
    // Get anchor's wallet's public key(從上面AnchorProvider.env()建立的)
    const key = anchor.AnchorProvider.env().wallet.publicKey;
    // Get the amount of SOL needed to pay rent for our Token Mint(要付租金給solana的帳戶)
    const lamports: number = await program.provider.connection.getMinimumBalanceForRentExemption(
      MINT_SIZE
    );

    // Get the ATA for a token and the account that we want to own the ATA (but it might not existing on the SOL network yet)
    associatedTokenAccount = await getAssociatedTokenAddress(
      mintKey.publicKey,
      key
    );

    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Use anchor to create an account from the mint key that we created
      anchor.web3.SystemProgram.createAccount({
        // The account that will transfer lamports to the created account
        // The account that is transfering the SOL balance to the other wallet
        // The account is paying for this operation
        fromPubkey: key, 
        
        // Public key of the created account
        newAccountPubkey: mintKey.publicKey, 
        
        // Amount of space in bytes to allocate to the created account
        space: MINT_SIZE, 
       
        // Public key of the program to assign as the owner of the created account
        programId: TOKEN_PROGRAM_ID, 
        
        // Amount of lamports to transfer to the created account
        // How much SOL we are transferring to the new account 
        lamports,
      }),
      // Fire a transaction to create our mint account that is controlled by our anchor wallet
      createInitializeMintInstruction(
        // mintKey.publicKey - token mint account
        // 0(decimals) - number 需要有多少0才形成一個完整的token（有點像Ethereum的單位）
        // key(intAuthority) — Minting authority 創造這個token的帳戶的owner
        // key(programID) - SPL token program account (signer account)
        mintKey.publicKey, 0, key, key
      ),
      // Create the ATA account that is associated with our mint on our anchor wallet
      createAssociatedTokenAccountInstruction(
        key, associatedTokenAccount, key, mintKey.publicKey
      )
    );

    // sends and create the transaction
    // mintKey = signer key
    const res = await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, [mintKey]);

    console.log(
      await program.provider.connection.getParsedAccountInfo(mintKey.publicKey)
    );

    console.log("Account: ", res);
    console.log("Mint key: ", mintKey.publicKey.toString());
    console.log("User: ", key.toString());

    // Executes our code to mint our token into our specified ATA
    await program.methods.mintToken().accounts({
      // 這邊是參照lib.rs的
      // publicKey送到solana之後會轉換成account，所以雖然lib.rs裡寫的是account，但是這邊要傳入的是publicKey
      mint: mintKey.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      to: associatedTokenAccount,
      authority: key,
    }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data.parsed.info.tokenAmount.amount;
    // check 我們mint的token是不是跟lib.rs裡寫的一樣是10個
    assert.equal(minted, 10);
  });

  // Transfer token
  it("Transfer token", async () => {
    // Get anchor's wallet's public key
    const myWallet = anchor.AnchorProvider.env().wallet.publicKey;
    // Wallet that will receive the token 
    // ATA I am using to send
    const toWallet: anchor.web3.Keypair = anchor.web3.Keypair.generate();
    // The ATA for a token on the to wallet (but might not exist yet)
    const toATA = await getAssociatedTokenAddress(
      mintKey.publicKey,
      toWallet.publicKey
    );

    // Fires a list of instructions
    const mint_tx = new anchor.web3.Transaction().add(
      // Create the ATA account that is associated with our To wallet
      createAssociatedTokenAccountInstruction(
        myWallet, toATA, toWallet.publicKey, mintKey.publicKey
      )
    );

    // Sends and create the transaction
    await anchor.AnchorProvider.env().sendAndConfirm(mint_tx, []);

    // Executes our transfer smart contract 
    await program.methods.transferToken().accounts({
      tokenProgram: TOKEN_PROGRAM_ID,
      from: associatedTokenAccount,
      authority: myWallet,
      to: toATA,
    }).rpc();

    // Get minted token amount on the ATA for our anchor wallet
    const minted = (await program.provider.connection.getParsedAccountInfo(associatedTokenAccount)).value.data.parsed.info.tokenAmount.amount;
    assert.equal(minted, 5);
  });
});
