const MyNFT = artifacts.require("NFTContract");

contract("NFTContract", (accounts) => {
    let myNFTInstance;

    before(async () => {
        myNFTInstance = await MyNFT.deployed();
    });

    it("should mint NFT", async () => {
        const tokenId = 1;

        // Mint NFT for the first account
        await myNFTInstance.mintNFT(tokenId, { from: accounts[0] });

        // Verify that the NFT was minted successfully
        const owner = await myNFTInstance.ownerOf(tokenId);
        assert.equal(owner, accounts[0], "NFT was not minted");
    });

    it("should not mint NFT after the minting period has ended", async () => {
        const tokenId = 2;

        // Advance the block timestamp to simulate the minting period being over
        const mintDuration = await myNFTInstance.mintDuration();
        await web3.currentProvider.send(
            {
                jsonrpc: "2.0",
                method: "evm_mine",
                params: [mintDuration + 8 * 24 * 60 * 60], // Add 8 days to mintDuration
                id: new Date().getTime(),
            },
            (error, _) => {
                if (error) {
                    console.error("Error advancing block timestamp:", error);
                }
            }
        );

        // Attempt to mint NFT after the minting period has ended
        try {
            await myNFTInstance.mintNFT(tokenId, { from: accounts[0] });
        } catch (error) {
            assert(error.toString().includes("Minting period has ended"), "Incorrect error message");
            return;
        }

        assert.fail("NFT was minted after the minting period ended");
    });

    // Add more test cases to cover other contract functionality
});

