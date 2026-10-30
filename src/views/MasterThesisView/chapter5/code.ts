/* eslint-disable quotes */
export const guardianCircuitCode = `
signal input msg[256];

signal input A[256];
signal input R8[256];
signal input S[256];

signal output hashPublicKey;
signal output increment;
signal output address;

// calculate guardian's address hash
component bitAToNum = Bits2Num(256);
component poseidon = Poseidon(1);

bitAToNum.in <== A;
poseidon.inputs[0] <== bitAToNum.out;
hashPublicKey <== poseidon.out;

// verify the signature
component verifier = EdDSAVerifier(256);
verifier.msg <== msg;
verifier.A <== A;
verifier.R8 <== R8;
verifier.S <== S;

// calculate increment and new owner address
calculationMessage.input <== msg;
increment <== calculationMessage.increment;
address <== calculationMessage.address;`;

export const accountFactoryCode = `
interface IAccountFactory {
    mapping(address => address) public owners;
    
    function createAccount(
        address owner, uint256 salt
    ) external returns (BaseAccount ret);
    
    function getAddress(
        address owner, 
        uint256 salt
    ) external view returns (address);

    function changeOwner(
        BaseAccount _account, 
        address _newOwner
    ) external;
}`;

export const getAddressCode = `
\\begin{array}{ll}
\\textit{account} \\gets \\text{owners}[\\textit{owner}] \\\\
\\textbf{if } \\textit{account} \\ne \\text{zero-address } \\textbf{then} \\\\
\\quad \\textbf{return } \\textit{account} \\\\
\\textbf{end if} \\\\
\\textit{account} \\gets \\text{Create2.computeAddress}(\\textit{owner}, \\textit{salt}) \\\\
\\textbf{return } \\textit{account}
\\end{array}`;

export const accountCode = `
contract Account is BaseAccount {
    address public owner;
    address public accountGuardian;

    modifier onlyAccountGuardian() {
        require(accountGuardian != address(0), 
        'guardian not setup yet');
        require(msg.sender == accountGuardian, 
        'only guardian manager');
    }

    function changeOwner(
    AccountFactory _accountFactory,
    address _newOwner
      ) public onlyAccountGuardian {
        require(_newOwner != owner && _newOwner != address(0), 'invalid newOwner');
        _accountFactory.changeOwner(this, _newOwner);
        owner = _newOwner;
      }

    function setUpGuardian(address _accountGuardian) public onlyOwner {
        require(accountGuardian == address(0), 'accountGuardian has been setup');
        accountGuardian = _accountGuardian;
        emit GuardianInitialized(_accountGuardian);
    }

    function deployGuardian(bytes32 _salt) public onlyOwner {
        ZKGuardian manager = (new ZKGuardian){salt: _salt}();
        manager.initialize(this);
        setUpGuardian(address(manager));
      }
}`;

export const zkContractCode = `
modifier isPublicSignalCorrect(uint _guardian, uint256 _increment, uint256 _hash);
        
    function isEnoughConfirm() public view returns (bool);
    
    function submitNewOwner(
        address _newOwner,
        AccountFactory accountFactory,
        uint256 salt
    ) public onlyOwner

    function confirmChangeOwner(
        uint[2] calldata _pA, 
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC, 
        uint[3] calldata _pubSignals
    ) external payable isPublicSignalCorrect(
        _pubSignals[0], 
        _pubSignals[1], 
        _pubSignals[2]);

    function changeOwner(AccountFactory accountFactory) public payable;

    function setupGuardians(
        uint[] memory _guardians,
        uint256 _threshold,
        uint256 _expirePeriod,
        uint256 _delay
    ) public onlyOwner;

    function setThreshold(uint256 _threshold) external onlyOwner;
    function addGuardian(uint _guardian) external onlyOwner;
    function removeGuardian(uint _guardian) external onlyOwner;
}`;

export const soulCode = `
function scheduleRecovery(
    address wallet,
    bytes32[] calldata newOwners,
    bytes calldata rawGuardian,
    bytes calldata guardianSignature
) external override returns (bytes32 recoveryId)`;

export const bundlerMethods = [
  {
    method: 'eth_chainId',
    description: 'Return network chainId.',
  },
  {
    method: 'eth_supportedEntryPoints',
    description: 'Return a list of the EntryPoint addresses supported by the bundler.',
  },
  {
    method: 'eth_sendUserOperation',
    description: 'Add a UserOp to the mempool.',
  },
  {
    method: 'eth_estimateUserOperationGas',
    description:
      "Estimates the gas values for a UserOp. Given a UserOp, which may not specify gas limits and gas prices, this function returns the necessary gas limits. The wallet ignores the signature field, so the operation does not need the user's approval.",
  },
  {
    method: 'eth_getUserOperationReceipt',
    description: 'Return a UserOp receipt based on a userOpHash returned by eth_sendUserOperation.',
  },
  {
    method: 'eth_getUserOperationByHash',
    description:
      'Return a UserOp response based on a userOpHash returned by eth_sendUserOperation.',
  },
  {
    method: 'web3_clientVersion',
    description: "Return bundler's version.",
  },
  {
    method: 'debug_bundler_clearState',
    description: 'Clears the bundler mempool and reputation data.',
  },
  {
    method: 'debug_bundler_dumpMempool',
    description: 'Dump the current UserOps mempool.',
  },
  {
    method: 'debug_bundler_clearMempool',
    description: "Clear mempool's state.",
  },
  {
    method: 'debug_bundler_setReputation',
    description: 'Sets reputation of given addresses.',
  },
  {
    method: 'debug_bundler_dumpReputation',
    description: 'Returns the reputation data of all observed addresses.',
  },
  {
    method: 'debug_bundler_clearReputation',
    description: "Clear reputation's state.",
  },
  {
    method: 'debug_bundler_setBundlingMode',
    description:
      'Sets bundling mode. After setting mode to “manual”, an explicit call to debug_bundler_sendBundleNow is required to send a bundle.',
  },
  {
    method: 'debug_bundler_setBundleInterval',
    description: "Change bundler's interval.",
  },
  {
    method: 'debug_bundler_sendBundleNow',
    description:
      'Forces the bundler to build and execute a bundle from the mempool as handleOps() transaction.',
  },
  {
    method: 'debug_bundler_getStakeStatus',
    description: 'Return stake information.',
  },
];

export const circuitStats = [
  { field: 'non-linear constraints', result: '19311' },
  { field: 'linear constraints', result: '817' },
  { field: 'public inputs', result: '0' },
  { field: 'private inputs', result: '1024 (1020 belong to witness)' },
  { field: 'public outputs', result: '3' },
  { field: 'wires', result: '21131' },
  { field: 'labels', result: '54047' },
  { field: 'witness size', result: '660.42KB' },
  { field: 'constraint size', result: '3.97MB' },
  { field: 'average time taken to generate proof', result: '2047.09ms' },
  { field: 'average time taken to verify proof', result: '14.88ms' },
];

export const transactionLocalStats = [
  {
    transaction: 'The first transfer 0.1BNB transaction with deploying account transaction',
    gasUsed: 292574,
    averageCostUSD: 0.572,
  },
  {
    transaction: 'The transfer 0.1BNB transaction',
    gasUsed: 100867,
    averageCostUSD: 0.197,
  },
  {
    transaction: 'Deploying guardian transaction',
    gasUsed: 2858839,
    averageCostUSD: 5.587,
  },
  {
    transaction: 'Verifying proof transaction',
    gasUsed: 271472,
    averageCostUSD: 0.513,
  },
];

export const transactionTestnetStats = [
  {
    transaction: 'The first transfer 0.1BNB transaction with deploying account transaction',
    gasUsed: 288088,
    averageCostUSD: 0.563,
  },
  {
    transaction: 'The transfer 0.1BNB transaction',
    gasUsed: 96942,
    averageCostUSD: 0.189,
  },
  {
    transaction: 'Deploying guardian transaction',
    gasUsed: 2854890,
    averageCostUSD: 5.579,
  },
  {
    transaction: 'Verifying proof transaction',
    gasUsed: 272074,
    averageCostUSD: 0.532,
  },
];

export const ComparisonTable = [
  ['Action', 'Reactive', 'Proactive', 'Reactive', 'Reactive', 'Reactive'],
  ['Recovery Type ', 'Fund', 'Account', 'Fund', 'Fund', 'Fund'],
  ['Account Type', 'Contract', 'Standard', 'Contract', 'Contract', 'Contract'],
  ['Guardian', 'No', 'No', 'Yes', 'Yes', 'Yes'],
  ['Multiple-key', 'No', 'Yes', 'No', 'No', 'No'],
  [
    'Custody',
    'Self-custodial',
    'Non-custodial',
    'Self-custodial',
    'Self-custodial',
    'Self-custodial',
  ],
  ['ZKP', 'No', 'No', 'No', 'Yes', 'Yes'],
];
