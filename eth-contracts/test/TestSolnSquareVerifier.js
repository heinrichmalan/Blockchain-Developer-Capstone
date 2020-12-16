var SquareVerifier = artifacts.require("SquareVerifier");
var SolnSquareVerifier = artifacts.require("SolnSquareVerifier");

let proof = require("../../zokrates/code/square/proof.json");
let { inputs } = proof;
let { proof: proofParts } = proof;

contract("TestSolnSquareVerifier", (accounts) => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    describe("proof verification", function () {
        beforeEach(async function () {
            let squareVerifier = await SquareVerifier.new();
            this.contract = await SolnSquareVerifier.new(
                squareVerifier.address,
                { from: account_one }
            );
        });

        it("new solution can be added and coin subsequently minted", async function () {
            // Test if a new solution can be added for contract - SolnSquareVerifier
            // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
            let tokenId = 42;
            let tokenURI = "mycooltokenURI";

            let res = await this.contract.mintNewNFT(
                account_two,
                tokenURI,
                tokenId,
                proofParts.a,
                proofParts.b,
                proofParts.c,
                inputs
            );
            // assert.equal(res, true);

            let events = await this.contract.getPastEvents("SolutionAdded");

            let eventFound = false;
            for (let evt of events) {
                const { submitter, index } = evt.returnValues;
                if (submitter == account_two && index == 0) {
                    eventFound = true;
                    break;
                }
            }

            expect(eventFound).to.be.true;

            let balance = await this.contract.balanceOf(account_two);
            assert.equal(balance, 1);
            let owner = await this.contract.ownerOf(tokenId);
            assert.equal(owner, account_two);
        });
    });
});
