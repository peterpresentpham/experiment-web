export const hashFunctionTable = [
  ['Hash function', 'SHA256', 'Keccak256', 'Pedersen', 'Poseidon', 'Poseidon2'],
  ['non-linear constraints', 29412, 145408, 3124, 216, 480],
  ['linear constraints', 1852, 17046, 132, 199, 552],
  ['wires', 31209, 155031, 3513, 417, 1034],
  ['labels', 205033, 654273, 8129, 583, 1842],
  ['witness size', '975.36KB', '4.73MB', '109.86KB', '13.11KB', '32.39KB'],
  ['constraint size', '6.65MB', '27.81MB', '673.53KB', '51.96KB', '142.70KB'],
  ['generate proof time (ms)', 832.63, 4882.06, 269.72, 124.31, 164.19],
  ['verification time (ms)', 10.63, 12.8, 11.16, 10.85, 10.84],
];

export const curveSignatureTable = [
  ['Curve signature', 'ECDSA', 'BabyJubJub'],
  ['non-linear constraints', 1508922, 19095],
  ['linear constraints', 131701, 615],
  ['wires', 1632054, 20713],
  ['labels', 2129808, 52949],
  ['witness size', '52.23MB', '647.36KB'],
  ['constraint size', '294.52MB', '3.90MB'],
  ['generate proof time (ms)', 44145.32, 2098.61],
  ['verification time (ms)', 998.12, 11.32],
];

export const submitNewOwnerCode = `
\\begin{array}{ll}
1. & \\textbf{if } \\_tempNewOwner = \\text{zero-address} \\textbf{ then} \\\\
2. & \\quad \\textbf{if } \\_newOwner \\ne \\text{owner} \\textbf{ then} \\\\
3. & \\quad\\quad \\_address \\gets \\text{accountFactory.getAddress}(\\_newOwner, \\text{salt}) \\\\
4. & \\quad\\quad \\textbf{if } \\text{isDeploy}(\\_address) = \\text{False} \\textbf{ then} \\\\
5. & \\quad\\quad\\quad \\_tempNewOwner \\gets \\_newOwner \\\\
6. & \\quad\\quad \\textbf{end if} \\\\
7. & \\quad \\textbf{end if} \\\\
8. & \\textbf{end if}
\\end{array}`;

export const generateProofCode = `
\\begin{array}{ll}
1. & \\text{Calculate } \\textit{publicKey} \\text{by using } \\textit{privateKey} \\\\
2. & \\{\\textit{R8}, \\textit{s}\\} \\gets \\textit{sign}(\\textit{privateKey}, \\textit{message}) \\\\
3. & \\{\\textit{proof}, \\textit{publicSignals}\\} = \\textit{proveProof}(\\textit{message}, \\textit{publicKey}, \\textit{R8}, \\textit{s}) \\\\
4. & Return \\{proof, publicSignals\\} \\\\
\\end{array}`;

export const theFirstStageCode = `
\\begin{array}{ll}
1. & \\textbf{if } {\\text{the confirmations have been enough already}} \\\\
2. & Return False \\\\
3. & \\textbf{end if } \\\\
4. & \\textit{hashAccount} \\gets \\textit{publicSignals}[0] \\\\
5. & \\textit{_increment} \\gets \\textit{publicSignals}[1] \\\\
6. & \\textbf{if } {\\textit{hashAccount} \\notin guardian\\_hash\\_list} \\\\
7. &     Return False \\\\
8. & \\textbf{end if } \\\\
9. & \\textbf{if } {\\textit{_increment \\neq increment}} \\\\
10. &     Return False \\\\
11. & \\textbf{end if } \\\\
12. & \\textbf{if } {\\_\\textit{tempNewOwner} \\neq \\textit{publicSignals}[2]} \\\\
13. &     Return False \\\\
14. & \\textbf{end if } \\\\
15. & Return True \\\\
\\end{array}`;

export const theSecondStageCode = `
\\begin{array}{ll}
\\textbf{if } \\textit{The proof hasn't been submitted already} \\textbf{ then} \\\\
\\quad \\textit{isValid} \\gets \\textit{verifyProof}(\\textit{pA}, \\textit{pB}, \\textit{pC}, \\textit{publicSignals}) \\\\
\\quad \\textbf{if } \\textit{isValid} = \\text{True} \\textbf{ then} \\\\
\\quad\\quad \\text{Update parameter } \\textit{confirms} \\\\
\\quad \\textbf{end if} \\\\
\\textbf{end if}
\\end{array}`;

export const proposedCircuitCode = `
\\begin{array}{ll}
\\textit{hashPublicKey} \\gets \\text{poseidonHashFunction}(\\textit{A}) \\\\
\\text{eddsaVerify}(\\textit{msg}, \\textit{A}, \\textit{R8}, \\textit{S}) \\\\
\\textit{increment} \\gets \\text{calculateIncrement}(\\textit{msg}) \\\\
\\textit{address} \\gets \\text{calculateAddress}(\\textit{msg}) \\\\
\\textbf{return } \\textit{hashPublicKey}, \\textit{increment}, \\textit{address}
\\end{array}`;
