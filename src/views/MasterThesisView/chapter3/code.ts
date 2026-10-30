export const entryPointCode = `
interface IEntryPoint {
  function handleOps(
    UserOperation[] calldata ops, 
    address payable beneficiary
  ) external;

  function handleAggregatedOps(
    UserOpsPerAggregator[] calldata opsPerAggregator,
    address payable beneficiary
  ) external;

  function simulateValidation(
    UserOperation calldata userOp
  ) external;
}`;
