export const stepsEn = [
  {
    "title": "Open Claude and sign in",
    "intro": "Use desktop Chrome and sign in to the account you want to verify.",
    "image": "guide/open-claude.png",
    "alt": "Actual Claude restriction page, displayed in English using Chrome Translate: Your account will remain closed.",
    "instructions": [
      "Open the Claude restriction page using the button below.",
      "If you see the sign-in page, sign in to the account you want to verify.",
      "Confirm the restriction message and keep the Claude tab open for the next step."
    ]
  },
  {
    "title": "Find standing and copy its cURL",
    "intro": "Follow this order in the Claude restriction tab. The screenshot marks F12, F5 and every action from 1 to 7.",
    "image": "guide/network-curl.png",
    "alt": "Real Chrome Network screenshot with numbered markers for F12, F5, Network, the standing filter and request, Copy and Copy as cURL.",
    "instructions": [
      "Press F12 to open Developer Tools; some keyboards need Fn + F12. On Mac use ⌥⌘I.",
      "Select Network, not Console.",
      "Keep DevTools open and press F5 to refresh Claude. On Mac press ⌘R.",
      "Type standing in the Network filter and find the request named standing.",
      "Right-click that standing request to open its menu.",
      "Hover over Copy to open its submenu.",
      "Click Copy as cURL. Do not choose Copy URL."
    ],
    "tip": "If standing is missing, select Network and refresh again. Chrome may translate the menu labels into your browser language."
  },
  {
    "title": "Return here and paste the cURL",
    "intro": "Switch back to OnHold and paste the complete cURL request you just copied.",
    "image": "guide/paste-curl.png",
    "alt": "Current OnHold form with Paste marked 1 and Next marked 2; the credential field is empty.",
    "instructions": [
      "Return to this site and click Paste in the cURL field, or use Ctrl+V (Mac: ⌘V).",
      "Click Next and wait for the server to verify the actual account restriction.",
      "After verification, review the NFT image and account details before minting."
    ],
    "tip": "Do not share the cURL in chats. The browser extracts only sessionKey for verification and discards other request headers."
  },
  {
    "title": "Generate the image, then mint",
    "intro": "Review the verified account, mint your NFT, then stake it to mine.",
    "image": "guide/nft-preview.png",
    "alt": "NFT example made with a synthetic account: red BANNED stamp, Max mining power 3 and Mint NFT button.",
    "instructions": [
      "Review the NFT image, plan, ban time and UUID. The screenshot uses a synthetic example account.",
      "Connect your wallet. Pro mining power is 1; Max is 3.",
      "Click Mint NFT, then sign and confirm the transaction in your wallet.",
      "After minting, stake the NFT in Mining."
    ],
    "tip": "Each verified restricted account can mint once. Holding alone earns nothing; staking starts mining."
  }
];
