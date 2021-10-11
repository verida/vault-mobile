#!/usr/bin/env bash
veridaJsPath=$1;
clientRnPath=$2;
currentDir=`pwd`;
echo "verida-js path: $veridaJsPath"
echo "client-rn path: $clientRnPath"

echo "Initializing verida-js..."
cd $veridaJsPath
git checkout main && git pull
npx lerna bootstrap

cd packages/encryption-utils
yarn link && yarn install && yarn run build && cd ..

cd keyring
yarn link && yarn install && yarn run build && cd ..

cd storage-link
yarn link && yarn install && yarn run build && cd ..

cd account
yarn link && yarn install && yarn run build && cd ..

cd 3id-utils-node
yarn link && yarn install && yarn run build && cd ..

cd client-ts
yarn link && yarn install && yarn run build && cd ..

cd account-3id-connect
yarn link && yarn install && yarn run build && cd ..

cd account-node
yarn link && yarn install && yarn run build && cd ..

cd account-web-vault
yarn link && yarn install && yarn run build && cd ..

cd client-ts
yarn link && yarn install
yarn link @verida/3id-utils-node @verida/account-3id-connect @verida/account-node @verida/account-web-vault @verida/encryption-utils @verida/keyring @verida/storage-link
yarn run build
echo "Done"

echo "Merging client-ts to client-rn..."
cd $veridaJsPath
git subtree split -P packages/client-ts -b subtree/client-rn-merge
cd $clientRnPath
git subtree pull -P client-rn $veridaJsPath subtree/client-rn-merge --squash -m "Merge client-ts"
cd $veridaJsPath
git branch -D subtree/client-rn-merge
echo "Done"

echo "Initializing client-rn..."
cd $clientRnPath/client-rn
yarn install
yarn link @verida/3id-utils-node @verida/account-3id-connect @verida/account-node @verida/account-web-vault @verida/encryption-utils @verida/keyring @verida/storage-link
yarn run build
echo "Done"

echo "Copying client-rn..."
rm -rf $currentDir/node_modules/@verida/client-rn
cp -LR $clientRnPath/client-rn $currentDir/node_modules/@verida
rn-nodeify --install --hack --yarn
echo "Done"


