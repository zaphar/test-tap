#!bash

usage()
{
    cat << HELPMSG
Usage: 
    create a distribution directory with the specified version
    $0 -d <dist directory> -v <version>

    print this help
    $0 -h
HELPMSG
}

while getopts ":d:v:h" OPTION
do
    case $OPTION in
        d)
            DIRNAME=$OPTARG
            ;;
        v)
            VERSION=$OPTARG
            ;;
        h)
            usage
            exit 1
            ;;
        ?)
            usage
            exit 1
            ;;
    esac
done

if [[ -z $DIRNAME ]]
then
    usage
    exit 1
fi

if [[ -z $VERSION ]]
then
    usage
    exit 1
fi

DIST="$DIRNAME-$VERSION"
ROOT="$(dirname $0)/.."
LIB="${ROOT}/lib";
TLIB="${ROOT}/tests";
SCRIPTS="Test/TAP.js Test/TAP/Class.js Test/TAP/Runner.js";

if [[ ! -d $DIST ]]
then
    mkdir $DIST
else
    rm -rf $DIST
    mkdir $DIST
fi

for s in $SCRIPTS
do
    cat - $LIB/$s >> $DIST/test_tap.js <<FILEMSG
///////////////////////////////////////
///// ${s} Version:${VERSION}
///////////////////////////////////////

FILEMSG
done
cp $LIB/Test/TAPBrowser.js $DIST/TAPBrowserHarness.js
cp $TLIB/TapHarness.html $DIST/TapHarness.html

tar -czv -f $DIST.tar.gz $DIST
rm -rf $DIST
