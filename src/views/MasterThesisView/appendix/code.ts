export const xorCode = `
template XorCircuit() {
    // private signal
    signal input x;
    signal input y;

    // intermediate signal
    signal t1 <== x + y;
    signal t2 <== x * y;
    signal t3 <== -2 * t2;

    // output signal
    signal output t4 <== t1 + t3;
}`;

export const guardianCode = `
template Guardian() {
  signal input msg[256];

  signal input A[256];
  signal input R8[256];
  signal input S[256];

  signal output hashPublicKey;
  signal output increment;
  signal output address;

  // Calculate guardian's address hash
  component bitAToNum = Bits2Num(256);
  component poseidon = Poseidon(1);
  bitAToNum.in <== A;
  poseidon.inputs[0] <== bitAToNum.out;
  hashPublicKey <== poseidon.out;

  // Verify signature
  component verifier = EdDSAVerifier(256);
  verifier.msg <== msg;
  verifier.A <== A;
  verifier.R8 <== R8;
  verifier.S <== S;

  // Calculate increment
  component incrementAnalytic = AnalyticMessage(0, 7);
  incrementAnalytic.msg <== msg;
  increment <== incrementAnalytic.result;

  // Calculate new owner address
  component addressAnalytic = AnalyticMessage(8, 31);
  addressAnalytic.msg <== msg;
  address <== addressAnalytic.result;
}`;

export const analyticMessageCode = `
template AnalyticMessage(begin, end) {
  signal input msg[256];

  signal output result;

  var _total = 0;
  var multiplicationLevel = 1;

  for (var i = end; i >= begin; i--) {
    var index = i * 8 + 7;
    var piece = msg[index];
    piece = piece * 2 + msg[index - 1];
    piece = piece * 2 + msg[index - 2];
    piece = piece * 2 + msg[index - 3];
    piece = piece * 2 + msg[index - 4];
    piece = piece * 2 + msg[index - 5];
    piece = piece * 2 + msg[index - 6];
    piece = piece * 2 + msg[index - 7];
    _total = _total + piece * multiplicationLevel;
    multiplicationLevel = multiplicationLevel * 256;
  }
  result <== _total;
}`;
