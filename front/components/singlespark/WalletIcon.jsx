// Host binding of SingleSparkFront WalletIcon: EIP-6963 artwork before the same brand-vector fallback.
import metamask from './assets/singlespark/wallets/metamask.svg';
import okx from './assets/singlespark/wallets/okx.svg';
import binance from './assets/singlespark/wallets/binance.svg';
import coinbase from './assets/singlespark/wallets/coinbase.svg';
import browser from './assets/singlespark/wallets/browser.svg';
import {SingleSparkIcon} from './dist/icons.js';
import {safeInjectedWalletIcon} from './runtime/walletMetadata.mjs';
const images={'Browser Wallet':browser,'MetaMask':metamask,'OKX Wallet':okx,'Binance Wallet':binance,'Coinbase Wallet':coinbase};
export function walletIconSrc(kind,icon){return safeInjectedWalletIcon(icon)||images[kind]||'';}
export function WalletIcon({kind,icon,size=24}){
 const src=walletIconSrc(kind,icon);
 return <span className="wallet-brand-icon" role="img" aria-label={kind} data-wallet-kind={kind} data-wallet-icon-source={safeInjectedWalletIcon(icon)?'eip6963':'fallback'} style={{width:size,height:size}}>{src?<img src={src} width={size} height={size} alt=""/>:<SingleSparkIcon name="wallet" size={size}/>}</span>;
}
