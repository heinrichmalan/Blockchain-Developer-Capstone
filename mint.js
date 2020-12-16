const Web3 = require("web3");
const SolnSquareVerifier = require("./eth-contracts/build/contracts/SolnSquareVerifier.json");
const HDWalletProvider = require("truffle-hdwallet-provider");
// const infuraKey = "fj4jll3k.....";
//
const fs = require("fs");
const { exit } = require("process");
const mnemonic = fs.readFileSync("eth-contracts/.secret").toString().trim();

const provider = new HDWalletProvider(
    mnemonic,
    `https://rinkeby.infura.io/v3/4051ea77f31c42d6b37fca7d7173c2e8`,
    1
);

const web3 = new Web3(provider);
const mint = async () => {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(
        SolnSquareVerifier.abi,
        "0x485Aa79FF71cd9896fcC0985Aae71633D6ec4c13"
    );

    for (let i = 1; i <= 10; i++) {
        const proofFileName = `proof-${i}.json`;
        const proofJson = require(`./proofs/${proofFileName}`);
        let { inputs } = proofJson;
        let { proof } = proofJson;
        contract.methods
            .mintNewNFT(
                accounts[0],
                String(i),
                i,
                proof.a,
                proof.b,
                proof.c,
                inputs
            )
            .send({ from: accounts[0], gas: 2000000 }, (error, result) => {
                console.log(error, result);
            });
    }
};

mint();
