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

#copy the files we need for initial setup
cp -r -f ~/sandbox/Test-TAP/lib/Test ext/

#now go back to where we started
cd $WORKING
