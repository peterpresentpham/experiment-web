import dynamic from 'next/dynamic';
import ThesisConfigProvider from 'src/context/thesis-config.context';
import Abbreviation from './Abbreviation';

const Abstract = dynamic(() => import('./Abstract'));
const Acknowledgement = dynamic(() => import('./Acknowledgement'));
const Appendix = dynamic(() => import('./appendix'));
const Chapter1 = dynamic(() => import('./chapter1'));
const Chapter2 = dynamic(() => import('./chapter2'));
const Chapter3 = dynamic(() => import('./chapter3'));
const Chapter4 = dynamic(() => import('./chapter4'));
const Chapter5 = dynamic(() => import('./chapter5'));
const Chapter6 = dynamic(() => import('./chapter6'));
const References = dynamic(() => import('./References'));

export default function MasterThesisPage() {
  return (
    <ThesisConfigProvider id="master-thesis" firstLevel="chapter">
      <Abbreviation className="mb-5" />
      <p className="text-center text-2xl font-bold">
        Account Abstraction Wallet with Social Recovery based on Zero-Knowledge Proof
      </p>
      <div className="mt-4">
        <Acknowledgement />
        <Abstract />
        <Chapter1 />
        <Chapter2 />
        <Chapter3 />
        <Chapter4 />
        <Chapter5 />
        <Chapter6 />
        <References />
        <Appendix />
      </div>
    </ThesisConfigProvider>
  );
}
