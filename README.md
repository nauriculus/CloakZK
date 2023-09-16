# CloakZK
- Your gateway to private OTC trading on Solana. With zero-knowledge proofs (zk proofs) using the Elusiv SDK, this tool provides an unparalleled level of privacy and security for your OTC trades.
> Video Demo: https://youtu.be/42i8pRTigG0

## Table Of Contents

* [About Cloak ZK](#about-cloakzk)
* [How it works](#how-it-works)
  * [Usage](#usage)
  * [Installation](#installation)
* [License](#license)
* [Authors](#authors)
* [Resources](#resources)

## About CloakZK

 - The CloakZK OTC Tool is designed to empower traders on the Solana network. By utilizing zero-knowledge proofs, we ensure that your trading data remains confidential and only accessible to the parties involved. This innovative technology safeguards your sensitive information while delivering swift and secure trades.

![Screenshot (1911)](https://github.com/nauriculus/CloakZK/assets/24634581/32e2c0a0-e0ce-401e-99cf-c04d219122b6)

## Features

- **Privacy First**: Harness the power of zk proofs to ensure that your OTC trades remain completely private and confidential. Your trade details are secured, shielded from unwanted exposure using the Elusiv SDK.
- **Fast and Efficient**: Built on the blazing-fast Solana blockchain, the CloakZK OTC Tool ensures lightning-quick transaction speeds, allowing you to execute trades swiftly without delay.
- **User-Friendly Interface**: Our intuitive user interface makes it easy for traders of all experience levels to navigate and engage in private OTC trading seamlessly.
- **Built for Solana**: Leverage the Solana network's scalability and performance, ensuring your OTC trades are executed swiftly and cost-effectively.

## How it works
- Currently, the trade creator enjoys the privilege of streamlined, automated, and private deposits through Elusiv. However, please note that Elusiv does not currently support NFTs. Consequently, the trade acceptor, the individual who participates in the trade via the link, is required to manually deposit tokens or NFTs into the specified deposit escrow wallet. Once both parties have confirmed the trade, an exchange of Tiplink escrow links occurs.

- It's worth highlighting that the privacy feature is reserved for the trade's buyer and seller. Funds are routed through Elusiv before being transferred to an entirely new wallet (escrow). While the NFT is still "exposed" due to the limitations of Tiplink, this exposure is mitigated. Withdrawals can be directed to any wallet, and funds can be effortlessly routed to any chosen destination. This unique approach ensures a high degree of privacy while maintaining the utmost security.

### Usage

1. Head over the the "OTC Trading" Tab
   
![Screenshot (1923)](https://github.com/nauriculus/CloakZK/assets/24634581/1825590a-fc79-4809-8a17-fbddced7a0f3)

2. Approve and Sign the message. This ensures and is required to send private transactions through Elusiv.
3. Connect your wallet and click on "New Trade" or put in a Trade Code into the given field and click on "New Trade" to start a new trade.
4. Wait until the data is loaded or approve incoming transaction for deposits.
   
![Screenshot (1928)](https://github.com/nauriculus/CloakZK/assets/24634581/8a7a33e1-f234-492b-bd24-1fadd9f6904f)

5. Prior to finalizing any transaction, it's imperative to verify the deposit wallet of your counterparty. ALso note the counterparty needs to manually send tokens to the given deposit wallet for now to ensure compatibility with all type of tokens. While we do not currently provide NFT validation and authenticity checks, we are committed to ensuring the security of your trades. Implementing such validations would involve hashlist logging of collections, but due to the inherent limitations in collection size availability for trading, we are unable to provide this feature at this time. To ensure your safety, we strongly advise vigilance against potential scams and recommend thorough scrutiny of all tokens.

![Screenshot (1911)](https://github.com/nauriculus/CloakZK/assets/24634581/66a0ffa1-9e91-4633-ac72-e87849f577bb)

6. Confirm the trade and wait until the counterparty does the same.

![Screenshot (1929)](https://github.com/nauriculus/CloakZK/assets/24634581/e9c0cad2-9eee-42c7-a5ee-323c5d093db5)
7. You can now claim your funds by using the provided button which will redirect you to the TipLink Escrow.

![Screenshot (1934)](https://github.com/nauriculus/CloakZK/assets/24634581/2ad46a0e-0947-428c-9321-8a61708b9809)


### Installation

1. Clone the repo

2. Install the required dependencies using npm i package.json

```sh
git clone https://github.com/nauriculus/CloakZK.git
```

3. Run it using npm start

## License
This project is licensed under the terms of the GNU General Public License v3.0.

## Disclaimer
This project is provided "AS IS", WITHOUT WARRANTIES OF ANY KIND, either express or implied. This project provides complex software that utilizes an advanced and experimental smart contract runtime.
We do not guarantee that the code in this project is error-free, complete, or up-to-date. Even with all measures taken to ensure its reliability, mistakes can still occur. We are not liable for any damages or losses that may result from your use of this project. Please use this project at your own risk.
We reserve the right to modify this disclaimer at any time.

## Authors
* **Nauriculus**  - [Nauriculus](https://github.com/Nauriculus/) - [Twitter](https://twitter.com/Nauriculus)

## Resources
* [Elusiv](https://elusiv.io/)
* [TipLink](https://tiplink.io)
* [IronForge](https://www.ironforge.cloud)
