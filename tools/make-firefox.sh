#!/usr/bin/env bash
#
# This script assumes a linux environment

set -e

echo "*** nervenschoner.firefox: Creating web store package"

BLDIR=dist/build
DES="$BLDIR"/nervenschoner.firefox
rm -rf $DES
mkdir -p $DES

echo "*** nervenschoner.firefox: Copying common files"
bash ./tools/copy-common-files.sh  $DES

# Firefox-specific
echo "*** nervenschoner.firefox: Copying firefox-specific files"
cp platform/firefox/*.json $DES/
cp platform/firefox/*.js   $DES/js/

# Firefox store-specific
cp -R $DES/_locales/nb     $DES/_locales/no

# Firefox/webext-specific
rm $DES/img/icon_128.png

echo "*** nervenschoner.firefox: Generating meta..."
python3 tools/make-firefox-meta.py $DES/

if [ "$1" = all ]; then
    echo "*** nervenschoner.firefox: Creating package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
elif [ -n "$1" ]; then
    echo "*** nervenschoner.firefox: Creating versioned package..."
    pushd $DES > /dev/null
    zip ../$(basename $DES).xpi -qr *
    popd > /dev/null
    mv "$BLDIR"/nervenschoner.firefox.xpi "$BLDIR"/nervenschoner_"$1".firefox.xpi
fi

echo "*** nervenschoner.firefox: Package done."
