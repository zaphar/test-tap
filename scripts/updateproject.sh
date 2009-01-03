#!/bin/bash

usage()
{
    cat << HELPMSG
Usage: 
    update this library in a javascript project for you
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
    mkdir $DIRNAME/ext
fi

echo copying the javascript test libraries
cp -r -f $MYDIR/../lib/Test $DIRNAME/ext/

#now go back to where we started
cd $WORKING
