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

##### 2. Transfer transaction
* Transfer token from one account to another
* Transfer Transaction requirements
    * Token program for our CpiContext
    * Amount to transfer
    * The sender's associated token account
    * The reciver's associated token account
    * The sender's authority to approve the transfer

### Part 2. Write tests to validate the program
#### Steps

