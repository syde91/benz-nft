// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    uint256 public constant MAX_NFT_SUPPLY = 5;
    uint256 public constant MINT_START_TIMESTAMP = 1641417600; // 7 Jan 2023, 00:00:00 (Unix timestamp)
    uint256 public constant MINT_END_TIMESTAMP = 1672953599; // 14 Dec 2023, 23:59:59 (Unix timestamp)

    mapping(address => mapping(string => bool)) private receipts;
    Counters.Counter private tokenIds;

    constructor() ERC721("MyNFT", "NFT") {}

    modifier onlyDuringMintWindow() {
        require(block.timestamp >= MINT_START_TIMESTAMP && block.timestamp <= MINT_END_TIMESTAMP, "Minting is not available at this time");
        _;
    }

    modifier onlyOncePerWalletAndReceipt(string memory receipt) {
        require(!receipts[msg.sender][receipt], "This wallet and receipt combination has already minted an NFT");
        _;
    }

    function mintNFT(
        string memory receipt
    ) external onlyDuringMintWindow onlyOncePerWalletAndReceipt(receipt) {
        string memory tokenURI = "https://somethign.";
        require(tokenIds.current() < MAX_NFT_SUPPLY, "Max NFT supply reached");

        uint256 newTokenId = tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        receipts[msg.sender][receipt] = true;
        tokenIds.increment();
    }
}

