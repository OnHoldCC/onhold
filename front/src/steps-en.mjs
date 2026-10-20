export const stepsEn = [
  {
    "title": "Open Claude and sign in",
    "intro": "Use desktop Chrome and sign in to the account you want to verify.",
    "image": "guide/open-claude.jpg",
    "alt": "Actual Claude restriction page, displayed in English using Chrome Translate: Your account will remain closed.",
    "instructions": [
      "Open the Claude restriction page using the button below.",
      "If you see the sign-in page, sign in to the account you want to verify.",
      "Confirm the restriction message and keep the Claude tab open for the next step."
    ],
    "tip": "Opening this URL is not proof of a ban. Server verification is still required."
  },
  {
    "title": "Find standing and copy its cURL",
    "intro": "Follow this order in the Claude restriction tab. Screenshot markers correspond to steps 2, 4, 5 and 6.",
    "image": "guide/network-curl.png",
    "alt": "Real Chrome Network screenshot with numbered markers for Network, the standing filter and request, Copy and Copy as cURL.",
    "instructions": [
      "Press F12 to open Developer Tools; some keyboards need Fn + F12. On Mac use ⌥⌘I.",
      "Select Network, not Console.",
      "Keep DevTools open and press F5 to refresh Claude. On Mac press ⌘R.",
      "Type standing in the Network filter and find the request named standing.",
      "Right-click that standing request to open its menu.",
      "Choose Copy → Copy as cURL. Do not choose Copy URL."
    ],
    "tip": "If standing is missing, select Network and refresh again. Chrome may translate the menu labels into your browser language."
  },
  {
    "title": "Return here and paste the cURL",
    "intro": "Switch back to onHold and paste the complete cURL request you just copied.",
    "image": "guide/verify.png",
    "alt": "Actual onHold verification form showing the cURL field and Paste button.",
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
    "image": "guide/verify.png",
    "alt": "Actual onHold verification form with an empty request field and a Paste control.",
    "instructions": [
      "Return here, paste the copied cURL or sessionKey and click Next.",
      "On step 2, review the PNG on the right and your verified plan and ban record: Pro weight is 1, Max is 3.",
      "Connect your wallet and click Mint NFT. Follow the progress dialog to sign and confirm. Stake in Mining after minting."
    ],
    "tip": "Each verified restricted account can mint once. Holding alone earns nothing; staking starts mining."
  }
];
