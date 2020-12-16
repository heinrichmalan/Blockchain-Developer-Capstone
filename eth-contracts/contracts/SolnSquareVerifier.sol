pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";
import "./SquareVerifier.sol";
import "openzeppelin-solidity/contracts/drafts/Counters.sol";

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
contract SolnSquareVerifier is CustomERC721Token {
    SquareVerifier verifier;

    constructor(address verifierContract) public CustomERC721Token() {
        verifier = SquareVerifier(verifierContract);
    }

    // TODO define a solutions struct that can hold an index & an address
    struct Solution {
        uint256 index;
        address submitter;
        bool submitted;
    }

    // TODO define an array of the above struct
    Solution[] private solutions;
    uint256 private numSolutions = 0;
    // TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => Solution) hashToSolnMapping;
    // TODO Create an event to emit when a solution is added
    event SolutionAdded(address submitter, uint256 index);

    // TODO Create a function to add the solutions to the array and emit the event
    function addSolution(
        address to,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public returns (bool) {
        bytes32 solutionHash = keccak256(abi.encodePacked(a, b, c, input));

        // Check if solution already submitted
        Solution memory solution = hashToSolnMapping[solutionHash];

        require(
            !solution.submitted,
            "Solution cannot already have been successfully submitted"
        );

        // Check if solution is valid
        bool validSolution = verifier.verifyTx(a, b, c, input);

        require(validSolution, "Solution must be a valid proof");

        // Add solution to array and hash-to-sol mapping
        Solution memory newSolution = Solution(numSolutions, to, true);
        hashToSolnMapping[solutionHash] = newSolution;
        solutions.push(newSolution);
        emit SolutionAdded(to, numSolutions);
        numSolutions += 1;
        return true;
    }

    // TODO Create a function to mint new NFT only after the solution has been verified
    //  - make sure the solution is unique (has not been used before)
    //  - make sure you handle metadata as well as tokenSuplly
    function mintNewNFT(
        address to,
        string memory tokenURI,
        uint256 tokenId,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[2] memory input
    ) public returns (bool) {
        // Adds solution and thus checks if it is unique
        require(!_exists(tokenId), "Token with specified ID already exists");
        bool solutionAdded = addSolution(to, a, b, c, input);

        require(solutionAdded, "Solution must be unique and valid");

        bytes32 solutionHash = keccak256(abi.encodePacked(a, b, c, input));
        Solution memory solution = hashToSolnMapping[solutionHash];

        // This should be true if solutionAdded is true
        require(
            solution.submitted && solution.submitter == to,
            "Solution must have been previously submitted"
        );

        bool minted = super.mint(to, tokenId, tokenURI);
        require(minted, "Token must have been successfully minted");
        return true;
    }
}
