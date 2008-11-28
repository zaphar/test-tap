#! /bin/bash

usage()
{
    cat << HELPMSG
Usage: 
    create a javascript test in the specified location
    $0 -d <test directory> <test_name>

    print this help
    $0 -h
HELPMSG
}

while getopts ":d:h" OPTION
do
    case $OPTION in
        d)
            DIRNAME=$OPTARG
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

shift $(($OPTIND - 1)) 

if [[ -z $DIRNAME ]]
then
    echo 'Must provide a test directory'
    usage
    exit 1
fi

if [[ -z $1 ]]
then
    echo 'Must provide a test name'
    usage
    exit 1
fi

TESTNAME=`echo $1 | tr '[:upper:]' '[:lower:]'`.t.js

cat > $DIRNAME/$TESTNAME << TEST 
(function() {
    var t = new Test.TAP.Class();
    t.plan('no_plan');

    t.setUp = function() {
    };

    t.testSomething = function() {
    };

    t.tearDown = function() {
    };

    return t;
})();
TEST
