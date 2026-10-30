/* eslint-disable quotes */

type ItemType = { id: string; methods: Array<string> };

type ConfigType = Array<{ title: string; data: Array<ItemType> }>;

export const F2LConfig: ConfigType = [
  {
    title: 'Group 1: basic F2L',
    data: [
      { id: '1.1', methods: ["U (R U' R')"] },
      { id: '1.2', methods: ["y' U' (R' U R)"] },
      { id: '1.3', methods: ["U' R' F R F' R U' R'"] },
    ],
  },
  {
    title: 'Group 2: basic F2L',
    data: [
      { id: '2.1', methods: ["R U R'"] },
      { id: '2.2', methods: ["y' (R' U' R)"] },
    ],
  },
  {
    title: 'Group 3',
    data: [
      { id: '3.1', methods: ["U (R U2 R') U (R U' R')"] },
      { id: '3.2', methods: ["y' U' (R' U2 R) U' (R' U R)"] },
      { id: '3.3', methods: ["U2 (R U R' U)(R U' R')"] },
      { id: '3.4', methods: ["y' U2 (R' U' R U')(R' U R)"] },
    ],
  },
  {
    title: 'Group 4',
    data: [
      { id: '4.1', methods: ["U (R U' R') (F R' F' R)"] },
      { id: '4.2', methods: ["U' (R F R' F') (R U R')"] },
    ],
  },
  {
    title: 'Group 5',
    data: [
      { id: '5.1', methods: ["(R U' R' U) (R U' R')"] },
      { id: '5.2', methods: ["(R U R' U') F R' F' R"] },
      { id: '5.3', methods: ["(R U R' U')(R U R')"] },
      { id: '5.4', methods: ["y' (R' U' R U)(R' U' R)"] },
    ],
  },
  {
    title: 'Group 6',
    data: [
      { id: '6.1', methods: ["U' (R U R') U2 (R U' R')"] },
      { id: '6.2', methods: ["d (R' U' R) U2' (R' U R)"] },
      { id: '6.3', methods: ["U' (R U2' R') U2 (R U' R')"] },
      { id: '6.4', methods: ["d (R' U2 R) U2' (R' U R)"] },
      { id: '6.5', methods: ["(R U' R') d (R' U2 R) U2' (R' U R)"] },
    ],
  },
  {
    title: 'Group 7',
    data: [
      { id: '7.1', methods: ["U' (R U R') U (R U R')"] },
      { id: '7.2', methods: ["d (R' U' R U')(R' U' R)"] },
      { id: '7.3', methods: ["U (R U R') U2 (R U R')"] },
      { id: '7.4', methods: ["(U' R U' R') U2 (R U' R')"] },
      { id: '7.5', methods: ["d (R' U2 R) d' (R U R')"] },
      { id: '7.6', methods: ["U' (R U2' R') d (R' U' R)"] },
      { id: '7.7', methods: ["d (R' U R U')(R' U' R)"] },
      { id: '7.8', methods: ["U' (R U' R' U)(R U R')"] },
    ],
  },
  {
    title: 'Group 8',
    data: [
      { id: '8.1', methods: ["R U2 R' U' (R U R')"] },
      { id: '8.2', methods: ["y' (R' U2 R) U (R' U' R)"] },
      { id: '8.3', methods: ["U (R' F R F') U (R U R')"] },
      { id: '8.4', methods: ["(R U' R' U) d (R' U' R)"] },
      { id: '8.5', methods: ["U (R' F R F')(R U R') U2 (R U' R')"] },
      { id: '8.6', methods: ["U' (F R' F' R) y' (R' U' R) U2 (R' U' R)"] },
    ],
  },
  {
    title: 'Group 9',
    data: [
      { id: '9.1', methods: ["U' (R U' R') U2 (R U' R')"] },
      { id: '9.2', methods: ["U (R U R') U2 (R U R')"] },
      { id: '9.3', methods: ["(U' R U R') d (R' U' R)"] },
      { id: '9.4', methods: ["U F' U' F U' (R U R')"] },
    ],
  },
  {
    title: 'Group 10',
    data: [
      { id: '10.1', methods: ["(R U' R') d (R' U' R)(U' R' U' R)"] },
      { id: '10.2', methods: ["(R U R') U2 (R U' R' U)(R U R')"] },
      { id: '10.3', methods: ["(R U' R') d (R' U' R U')(R' U' R)"] },
      { id: '10.4', methods: ["(R U' R' U) d (R' U' R U') (R' U R)"] },
    ],
  },
];
