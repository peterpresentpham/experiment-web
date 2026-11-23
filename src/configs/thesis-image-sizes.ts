/**
 * Pixel sizes of the master thesis figures, so each one reserves its real shape before it loads
 * (a wrong shape moves the content under a link's target as the images arrive).
 * `src/__tests__/thesis/thesis-image-sizes.test.ts` checks them against the files.
 */
export const THESIS_IMAGE_SIZES: Record<string, { width: number; height: number }> = {
  '/images/master-thesis/appendix/circom-compiler.png': { width: 496, height: 371 },
  '/images/master-thesis/chapter2/blockchain-structure.png': { width: 1011, height: 331 },
  '/images/master-thesis/chapter2/contract-account.png': { width: 321, height: 271 },
  '/images/master-thesis/chapter2/eoa.png': { width: 332, height: 271 },
  '/images/master-thesis/chapter2/interactive-zkp.png': { width: 401, height: 159 },
  '/images/master-thesis/chapter2/non-interactive-proof.png': { width: 541, height: 261 },
  '/images/master-thesis/chapter2/smart-contract.png': { width: 536, height: 361 },
  '/images/master-thesis/chapter2/unspent-transaction-model.png': { width: 1007, height: 531 },
  '/images/master-thesis/chapter3/account-abstraction.png': { width: 441, height: 231 },
  '/images/master-thesis/chapter3/multicall.png': { width: 611, height: 71 },
  '/images/master-thesis/chapter3/multicall1.png': { width: 411, height: 71 },
  '/images/master-thesis/chapter3/erc4337-smart-contract.png': { width: 410, height: 414 },
  '/images/master-thesis/chapter3/erc4337.png': { width: 721, height: 421 },
  '/images/master-thesis/chapter3/losing-bitcoin.png': { width: 1913, height: 949 },
  '/images/master-thesis/chapter3/hacking.png': { width: 600, height: 371 },
  '/images/master-thesis/chapter4/change-ownership-process.png': { width: 471, height: 298 },
  '/images/master-thesis/chapter4/common-architecture.png': { width: 881, height: 511 },
  '/images/master-thesis/chapter4/xor-circuit.png': { width: 406, height: 418 },
  '/images/master-thesis/chapter4/verification-process.png': { width: 898, height: 745 },
  '/images/master-thesis/chapter4/overall-confirm-owner.png': { width: 571, height: 501 },
  '/images/master-thesis/chapter4/relation-time-delay.png': { width: 521, height: 230 },
  '/images/master-thesis/chapter4/updating-process.png': { width: 558, height: 81 },
  '/images/master-thesis/chapter5/zksnark-compiler.png': { width: 441, height: 431 },
  '/images/master-thesis/chapter5/soul-wallet.png': { width: 491, height: 61 },
};
