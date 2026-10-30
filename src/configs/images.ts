export const IMAGES = {
  cli: {
    bun: '/images/cli/bun.svg',
    npm: '/images/cli/npm.svg',
    pnpm: '/images/cli/pnpm.svg',
    yarn: '/images/cli/yarn.svg',
  },
  rubik3x3: {
    byId: (id: string) => `/images/rubik3x3/${id}.webp`,
  },
  master: {
    appendix: {
      circomCompiler: '/images/master-thesis/appendix/circom-compiler.png',
    },
    chapter2: {
      structure: '/images/master-thesis/chapter2/blockchain-structure.png',
      contract: '/images/master-thesis/chapter2/contract-account.png',
      eoa: '/images/master-thesis/chapter2/eoa.png',
      izk: '/images/master-thesis/chapter2/interactive-zkp.png',
      nizk: '/images/master-thesis/chapter2/non-interactive-proof.png',
      smartContract: '/images/master-thesis/chapter2/smart-contract.png',
      unspentTransaction: '/images/master-thesis/chapter2/unspent-transaction-model.png',
    },
    chapter3: {
      accountAbstraction: '/images/master-thesis/chapter3/account-abstraction.png',
      multicall: '/images/master-thesis/chapter3/multicall.png',
      multicall1: '/images/master-thesis/chapter3/multicall1.png',
      erc4337Contract: '/images/master-thesis/chapter3/erc4337-smart-contract.png',
      erc4337: '/images/master-thesis/chapter3/erc4337.png',
      losingBitcoin: '/images/master-thesis/chapter3/losing-bitcoin.png',
      hacking: '/images/master-thesis/chapter3/hacking.png',
    },
    chapter4: {
      changeOwnershipProcess: '/images/master-thesis/chapter4/change-ownership-process.png',
      commonArchitecture: '/images/master-thesis/chapter4/common-architecture.png',
      xorCircuit: '/images/master-thesis/chapter4/xor-circuit.png',
      verificationProcess: '/images/master-thesis/chapter4/verification-process.png',
      overallConfirmOwner: '/images/master-thesis/chapter4/overall-confirm-owner.png',
      relationTimeDelay: '/images/master-thesis/chapter4/relation-time-delay.png',
      updatingProcess: '/images/master-thesis/chapter4/updating-process.png',
    },
    chapter5: {
      zksnarkCompiler: '/images/master-thesis/chapter5/zksnark-compiler.png',
      soulWallet: '/images/master-thesis/chapter5/soul-wallet.png',
    },
  },
};
