const keys=["assetContracts","assetAddToken","assetAdded","assetCancelled","assetFailed"];
const copy={
 en:["Contract addresses","Add OnHold to wallet","Asset added to your wallet.","Wallet request cancelled.","Your wallet could not add this asset. You can import it manually using the contract address."],
 zh:["合约地址","添加 OnHold 到钱包","已添加到钱包。","已取消钱包请求。","钱包未能添加此资产，可使用下方合约地址手动导入。"],
 ja:["コントラクトアドレス","OnHold をウォレットに追加","追加しました。","リクエストをキャンセルしました。","追加できませんでした。コントラクトアドレスで手動インポートできます。"],
 ko:["계약 주소","지갑에 OnHold 추가","지갑에 추가했습니다.","지갑 요청이 취소되었습니다.","추가하지 못했습니다. 계약 주소로 직접 가져올 수 있습니다."],
 es:["Direcciones de contratos","Añadir OnHold a la billetera","Activo añadido.","Solicitud cancelada.","No se pudo añadir. Puedes importarlo manualmente con la dirección del contrato."],
 fr:["Adresses des contrats","Ajouter OnHold au portefeuille","Actif ajouté.","Demande annulée.","Ajout impossible. Importez manuellement avec l’adresse du contrat."],
 de:["Vertragsadressen","OnHold zur Wallet hinzufügen","Asset hinzugefügt.","Anfrage abgebrochen.","Hinzufügen fehlgeschlagen. Importiere das Asset manuell über die Vertragsadresse."],
 pt:["Endereços dos contratos","Adicionar OnHold à carteira","Ativo adicionado.","Pedido cancelado.","Não foi possível adicionar. Importe manualmente com o endereço do contrato."]
};
const labels={"token":"OnHold · ERC-20","nft":"Claude Code Ban Pass · ERC-721","gameplay":"Mining / Ads / Vault · Proxy","implementation":"Gameplay implementation","renderer":"NFT renderer","taxProcessor":"Flap tax processor","tokenImplementation":"Token implementation","portal":"Flap Portal","burnVault":"Burn Vault","burnToken":"Flap burn token"};
export const assetCopy=Object.fromEntries(Object.entries(copy).map(([lang,values])=>[lang,{...Object.fromEntries(keys.map((key,i)=>[key,values[i]])),...Object.fromEntries(Object.entries(labels).map(([key,value])=>['asset.'+key,value]))}]));
Object.assign(assetCopy.zh,{"asset.token":"OnHold 代币 · ERC-20","asset.nft":"封禁通行证 · ERC-721","asset.gameplay":"挖矿 / 广告 / 金库 · 代理合约","asset.implementation":"玩法实现合约","asset.renderer":"NFT 渲染合约","asset.taxProcessor":"Flap 税费处理合约","asset.tokenImplementation":"代币实现合约","asset.portal":"Flap Portal","asset.burnVault":"回购销毁金库","asset.burnToken":"Flap 销毁代币"});
