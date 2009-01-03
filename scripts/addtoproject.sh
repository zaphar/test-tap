#!/bin/bash

usage()
{
    cat << HELPMSG
Usage: 
    add this library to a javascript project for you
    $0 -d <project path>

    print this help
    $0 -h
HELPMSG
}

while getopts "d:h" OPTION
do
    case $OPTION in
        d)
            DIRNAME=$OPTARG
            ;;
        h)
            usage
            exit 0
            ;;
        ?)
            usage
            exit 1
    esac
done

MYDIR=$(dirname $0)

if [[ -z $DIRNAME ]]
then
    echo "No -d option was present. You must provide a Project path.";
    usage
    exit 1
fi

echo "Setting up in project: ${DIRNAME}"

#set up the directory structure
if [[ ! -d $DIRNAME/ext ]]
then
    echo Making ${DIRNAME}/ext
    mkdir $DIRNAME/ext
fi

if [[ ! -d $DIRNAME/harness ]]
then
    echo Making ${DIRNAME}/harness
    mkdir $DIRNAME/harness
fi

if [[ ! -d $DIRNAME/t || -d $DIRNAME/tests ]]
then
    echo Making ${DIRNAME}/t
    mkdir $DIRNAME/t
fi

echo copy the files we need for initial setup
cp -r -f $MYDIR/../lib/Test $DIRNAME/ext/
if [[ -d $DIRNAME/t ]]
then
    echo copying TapHarness.html to $DIRNAME/t/
    cp -r -f $MYDIR/../tmpl/TapHarness.html $DIRNAME/t/
elif [[ -d tests ]]
then
    echo copying TapHarness.html to $DIRNAME/tests/
    cp -r -f $MYDIR/../tmpl/TapHarness.html $DIRNAME/tests/
fi

echo copying rhino harnesses to $DIRNAME/harness/
cp -r -f $MYDIR/../tmpl/*rhino* $DIRNAME/harness/

