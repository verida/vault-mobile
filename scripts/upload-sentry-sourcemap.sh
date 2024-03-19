#!/usr/bin/env bash
VersionName=$1;
VersionCode=$2;

DedaultBundleName="io.verida.vault"
[[ "$3" == "internal" ]] && BundleName="$DedaultBundleName.internal" || BundleName=$DedaultBundleName 

if [ $# -eq 0 ]
  then
    echo "Missing VersionName and VersionCode, eg: upload-sentry-sourcemap.sh 0.3.11 99"
    exit 1
fi

echo "Bundle Name: $BundleName"

echo "Generate sourcemap for iOS"
npx react-native bundle --entry-file='index.js' --bundle-output='main.jsbundle' --sourcemap-output='main.jsbundle.map' --dev=false --platform='ios' --reset-cache

# echo "Generate sourcemap for Android"
# npx react-native bundle --entry-file='index.js' --bundle-output='index.android.bundle' --sourcemap-output='index.android.bundle.map' --dev=false --platform='android' --reset-cache

echo "Upload sourcemap for iOS"
node_modules/@sentry/cli/bin/sentry-cli releases --org veridaio --project verida-wallet \
    files "$BundleName@$VersionName+$VersionCode" \
    upload-sourcemaps \
    --dist $VersionCode \
    --strip-prefix /path/to/project/root \
    main.jsbundle main.jsbundle.map

# echo "Upload sourcemap for Android"
# node_modules/@sentry/cli/bin/sentry-cli releases --org veridaio --project verida-wallet \
#     files "$BundleName@$VersionName+$VersionCode" \
#     upload-sourcemaps \
#     --dist $VersionCode \
#     --strip-prefix /path/to/project/root \
#     index.android.bundle index.android.bundle.map

