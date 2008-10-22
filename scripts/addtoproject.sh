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

if [[ -z $DIRNAME ]]
then
    echo "No -d option was present. You must provide a Project path.";
    usage
    exit 1
fi

echo "Setting up in project: ${DIRNAME}"


#create our project directory
cd $DIRNAME

#set up the directory structure
if [[ ! -d ext ]]
then
    mkdir ext
fi

if [[ ! -d harness ]]
then
    mkdir harness
fi

if [[ ! -d t || -d tests ]]
then
    mkdir t
fi

#copy the files we need for initial setup
cp -r -f ~/sandbox/Test-TAP/lib/Test ext/
if [[ -d t ]]
then
    cp -r -f ~/sandbox/Test-TAP/tmpl/TapHarness.html t/
elif [[ -d tests ]]
then
    cp -r -f ~/sandbox/Test-TAP/tmpl/TapHarness.html tests/
fi

cp -r -f ~/sandbox/Test-TAP/tmpl/*rhino* harness/

#now go back to where we started
cd $WORKING
