var CustomERC721Token = artifacts.require("CustomERC721Token");

contract("TestERC721Mintable", (accounts) => {
    const account_one = accounts[0];
    const account_two = accounts[1];

    describe("match erc721 spec", function () {
        beforeEach(async function () {
            this.contract = await CustomERC721Token.new({ from: account_one });

            // TODO: mint multiple tokens
            await this.contract.mint(account_two, 1, "token1");
            await this.contract.mint(accounts[2], 2, "token2");
        });

        it("should return the correct owners for the tokens", async function () {
            let token1Owner = await this.contract.ownerOf(1);
            assert.equal(token1Owner, account_two);

            let token2Owner = await this.contract.ownerOf(2);
            assert.equal(token2Owner, accounts[2]);
        });

        it("should return total supply", async function () {
            let res = await this.contract.totalSupply();

            assert.equal(res, 2);
        });

        it("should get token balance", async function () {
            let res = await this.contract.balanceOf(account_two);

            assert.equal(res, 1);
        });

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it("should return token uri", async function () {
            let res = await this.contract.tokenURI(1);

            assert.equal(
                res,
                "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1"
            );
        });

        it("should transfer token from one owner to another", async function () {
            await this.contract.transferFrom(account_two, accounts[2], 1, {
                from: account_two,
            });

            let res = await this.contract.balanceOf(accounts[2]);
            assert.equal(res, 2);
        });
    });

    describe("have ownership properties", function () {
        beforeEach(async function () {
            this.contract = await CustomERC721Token.new({ from: account_one });
        });

        it("should fail when minting when address is not contract owner", async function () {
            try {
                await this.contract.mint(accounts[3], 3, "token3", {
                    from: accounts[3],
                });
                throw Error("Should not be able to mint if not contract owner");
            } catch {}
        });

        it("should return contract owner", async function () {
            let res = await this.contract.getOwner.call();
            assert.equal(res, accounts[0]);
        });
    });
});
