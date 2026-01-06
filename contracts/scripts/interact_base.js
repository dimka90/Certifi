const { ethers } = require("ethers");
require("dotenv").config();

// Contract ABI
const ABI = [
    "function owner() public view returns (address)",
    "function registerInstitution(string name, string institutionID, string email, string country, uint8 institutionType) external",
    "function authorizeInstitution(address institution) external",
    "function issueCertificate(tuple(address studentWallet, string studentName, string studentID, string degreeTitle, uint8 grade, string duration, string cgpa, uint8 faculty, string tokenURI)) external returns (uint256)",
    "function getInstitution(address addr) external view returns (tuple(string name, string institutionID, address walletAddress, string email, string country, uint8 institutionType, uint256 registrationDate, bool isAuthorized, uint256 totalCertificatesIssued))",
    "function registeredInstitutions(address) public view returns (bool)"
];

const CONTRACT_ADDRESS = "0x33A21018CF5Ccf399f98DeDfc29eAa1AbEEF0AAB";
const RPC_URL = "https://mainnet.base.org";

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error("Please set PRIVATE_KEY in your .env file");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log(`Using Wallet: ${wallet.address}`);
    console.log(`Target Contract: ${CONTRACT_ADDRESS}`);

    let txCount = 0;
    let nonce = await wallet.getNonce("pending");
    console.log(`Current Nonce (pending): ${nonce}`);

    // 1. Check if registered
    const isRegistered = await contract.registeredInstitutions(wallet.address);
    if (!isRegistered) {
        console.log("Registering institution...");
        const tx = await contract.registerInstitution(
            "Base Academy",
            "BASE-001",
            "admin@base.edu",
            "Global",
            0, // University
            { nonce: nonce++, gasLimit: 500000 }
        );
        console.log(`   -> Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   -> Registered!`);
        txCount++;
    } else {
        console.log("Institution already registered.");
    }

    // 2. Check if authorized (if we are owner)
    const owner = await contract.owner();
    let instDetails = await contract.getInstitution(wallet.address);

    if (owner === wallet.address && !instDetails.isAuthorized) {
        console.log("Authorizing self...");
        const tx = await contract.authorizeInstitution(wallet.address, { nonce: nonce++, gasLimit: 500000 });
        console.log(`   -> Hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   -> Authorized!`);
        txCount++;
        instDetails = await contract.getInstitution(wallet.address);
    }

    console.log(`Current Authorization Status: ${instDetails.isAuthorized}`);

    // 3. Issue certificates until we reach ~10 transactions
    const targetTx = 10;
    console.log(`Proceeding to issue certificates until ${targetTx} total successful actions in this run are reached...`);

    while (txCount < targetTx) {
        console.log(`Issuing certificate ${txCount + 1}/${targetTx} (Nonce: ${nonce})...`);
        try {
            const tx = await contract.issueCertificate({
                studentWallet: ethers.Wallet.createRandom().address,
                studentName: `Student ${txCount + 1}`,
                studentID: `STUDENT-${1000 + txCount}`,
                degreeTitle: "Blockchain Degree",
                grade: 0, // FirstClass
                duration: "4 Years",
                cgpa: "4.0",
                faculty: 9, // Technology
                tokenURI: "ipfs://QmExample..."
            }, {
                nonce: nonce++,
                gasLimit: 600000
            });
            console.log(`   -> Pending... Hash: ${tx.hash}`);
            await tx.wait();
            console.log(`   -> Success!`);
            txCount++;

            // Short delay to allow the network to catch up
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            console.error(`   -> Error issuing certificate: ${e.message}`);
            // If nonce error, try to resync nonce and continue
            if (e.message.includes("nonce") || e.message.includes("replacement transaction")) {
                nonce = await wallet.getNonce("pending");
                console.log(`Resyncing nonce to: ${nonce}`);
                continue;
            }
            break;
        }
    }

    console.log(`\nDone! Total transactions executed: ${txCount}`);
}

main().catch(console.error);
