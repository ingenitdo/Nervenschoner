#!/usr/bin/env bash
#
# This script assumes a linux environment

set -e

echo "*** nervenschoner.chromium: Creating web store package"

DES=dist/build/nervenschoner.chromium
rm -rf $DES
mkdir -p $DES

echo "*** nervenschoner.chromium: Copying common files"
bash ./tools/copy-common-files.sh  $DES

# Chromium-specific
echo "*** nervenschoner.chromium: Copying chromium-specific files"
cp platform/chromium/*.js   $DES/js/
cp platform/chromium/*.html $DES/
cp platform/chromium/*.json $DES/

# Chrome store-specific
cp -R $DES/_locales/nb $DES/_locales/no

echo "*** nervenschoner.chromium: Generating meta..."
python3 tools/make-chromium-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** nervenschoner.chromium: Creating plain package..."
    pushd $(dirname $DES/) > /dev/null
    zip nervenschoner.chromium.zip -qr $(basename $DES/)/*
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** nervenschoner.chromium: Creating versioned package..."
    pushd $(dirname $DES/) > /dev/null
    zip nervenschoner_"$1".chromium.zip -qr $(basename $DES/)/*
    popd > /dev/null
fi

echo "*** nervenschoner.chromium: Package done."
