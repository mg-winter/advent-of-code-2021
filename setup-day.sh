#!/bin/bash

YEAR=2021
DAY=$1
echo $YEAR/$DAY

mkdir ./day-$DAY
mkdir ./day-$DAY/input
mkdir ./day-$DAY/tests

touch ./day-$DAY/input/input-day-$DAY.txt
touch ./day-$DAY/tests/test-1.txt

for FILE in ./templates/*;
do
    TEMPLATE_NAME=$(basename -- "$FILE")
    FINAL_NAME="${TEMPLATE_NAME/DAY/$DAY}"
    FINAL_PATH=./day-$DAY/$FINAL_NAME
    cp $FILE  $FINAL_PATH
    sed -i '' -e "s/|DAY|/$DAY/" "$FINAL_PATH"
    sed -i '' -e "s/|YEAR|/$YEAR/" "$FINAL_PATH"
done