#!/bin/bash

source ./.import-vars.sh

DAY=$1

mkdir ./day-$DAY
mkdir ./day-$DAY/input
mkdir ./day-$DAY/tests

curl --cookie "session=$SESSION" "https://adventofcode.com/$YEAR/day/$DAY/input" > ./day-$DAY/input/input-day-$DAY.txt
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