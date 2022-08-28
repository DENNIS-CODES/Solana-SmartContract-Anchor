# Solana-SmartContract-Anchor
## Minting and Transfering Token/NFT with Anchor

* 這邊的內容是參考[Youtube video: Solana Smart Contract: Minting and Transfering Token/NFT with Anchor](https://youtu.be/3GHlk6vosQw)影片做的筆記

* What is anchor?
A framework for quickly building secure Solana programs.

## Reference:
1. [Youtube video: Solana Smart Contract: Minting and Transfering Token/NFT with Anchor](https://youtu.be/3GHlk6vosQw)
2. [Anchor Installation](https://www.anchor-lang.com/docs/installation)
3. [Anchor book](https://book.anchor-lang.com/)
4. [Anchor github](https://github.com/coral-xyz/anchor)
5. [Solana Token Program](https://spl.solana.com/)
6. [Josh大神Github](https://github.com/chang47/Anchor-Mint-and-Transfer-Smart-Contract)
7. [Rust docs about anchor_spl](https://docs.rs/anchor-spl/latest/anchor_spl/)
8. [Rust docs about spl-token](https://docs.rs/spl-token/latest/spl_token/)

## Goals
    * Write smart contract to mint and transfer tokens
    * Write tests to validate the program

### Create an anchor project
- Initial 
```
    anchor init token-contract
    cd token-contract
```
- Set Test
```
    yarn add ts-mocha 
    anchor test
```
- 到Cargo.tomltoken-contract/programs/token-contract/Cargo.toml)修改套件版本和新增套件，不然會報錯
![](images/cargoset.png)

### Part 1. Write the smart contract
#### Steps
##### 1. Writing Token mint transacion
* Give a token, mint a token to a account
* Mint Transaction Requirements
    * Token program for our CpiContext
    * Amount to mint
    * The token account that represent our token
    * Who we want to mint tokens to
    * The token authority to allow us to mint
1. 參考[Rust mint_to](https://docs.rs/anchor-spl/latest/anchor_spl/token/fn.mint_to.html)文件在[lib.rs](token-contract/programs/token-contract/src/lib.rs)檔案中新增mint function需要調用的參數
```rust
#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub mint: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    #[account(mut)]
    pub authority: AccountInfo<'info>,
}
```
2. 新增mint token function在token_contract中
```rust
pub fn mint_token(ctx: Context<MintToken>) -> Result<()> {
        let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(), 
        to: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, 10)?;
        Ok(())
    }
```

##### 2. Transfer transaction
* Transfer token from one account to another
* Transfer Transaction requirements
    * Token program for our CpiContext
    * Amount to transfer
    * The sender's associated token account
    * The reciver's associated token account
    * The sender's authority to approve the transfer

1. 參考[Rust Transfer](https://docs.rs/anchor-spl/latest/anchor_spl/token/struct.Transfer.html)文件在[lib.rs](token-contract/programs/token-contract/src/lib.rs)檔案中新增Transfer function需要調用的參數
```rust
#[derive(Accounts)]
pub struct Transfer<'info> {
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub from: AccountInfo<'info>,
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}
```
2. 新增Transfer function在token_contract中
```rust
pub fn transfer_token(ctx: Context<TransferToken>) -> Result<()> {
        let transfer_instruction = Transfer{
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
         
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, transfer_instruction);
        anchor_spl::token::transfer(cpi_ctx, 5)?;
        Ok(())
    } 
```

##### 3. `anchor build`
成功會長這樣
![](images/anchorbuild.png)

```
To deploy this program:
  $ solana program deploy /Users/sirius/docs/BlockChain/Solana_github/Solana-SmartContract-Anchor/token-contract/target/deploy/token_contract.so
The program address will default to this keypair (override with --program-id):
  /Users/sirius/docs/BlockChain/Solana_github/Solana-SmartContract-Anchor/token-contract/target/deploy/token_contract-keypair.json
```

* 注意！
因為我們在Account前加了 `#[account(mut)]`讓Account是可以變動的，anchor不喜歡他會抱怨，所以我們要在每一個`#[account(mut)]`前面加上anchor規定的`/// CHECK: blabla~~~~`他才不會抱怨喔！
![](images/checkerror.png)

加完`/// CHECK: blabla~~~~`再`anchort build`一次，他就沒有抱怨啦！
![](images/withoutcheckerror.png)


* Mint 和 Transfer的設定其實很像，[lib.rs](token-contract/programs/token-contract/src/lib.rs)中有詳細的註解，或也可以回到Josh大神的影片去看詳細的解釋喔！

### Part 2. Write tests to validate the program
#### Steps

