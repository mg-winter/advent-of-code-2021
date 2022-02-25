#!/bin/bash

source ./.import-vars.sh

DAY=$1
MAIN_CLASS_NAME=$2

mkdir ./day-$DAY
mkdir ./day-$DAY/input
mkdir ./day-$DAY/tests
mkdir ./day-$DAY/test

curl --cookie "session=$SESSION" "https://adventofcode.com/$YEAR/day/$DAY/input" > ./day-$DAY/input/input-day-$DAY.txt
touch ./day-$DAY/tests/test-1.txt

for FILE in `find ./templates -type f`;
do
    TEMPLATE_NAME=`echo $FILE | sed "s/.\/templates\///"` #$(basename -- "$FILE")
    FINAL_NAME="${TEMPLATE_NAME/DAY/$DAY}"
    FINAL_PATH=./day-$DAY/$FINAL_NAME
    cp $FILE  $FINAL_PATH
    sed -i '' -e "s/|DAY|/$DAY/" "$FINAL_PATH"
    sed -i '' -e "s/|YEAR|/$YEAR/" "$FINAL_PATH"

    if [ ! -z "$MAIN_CLASS_NAME" ]; 
    then
         sed -i '' -e "s/DayCalculatorRenameMe/$MAIN_CLASS_NAME/" "$FINAL_PATH"
    fi
done