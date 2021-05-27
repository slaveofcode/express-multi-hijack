#!/bin/sh
rm -Rf ./dist
mkdir dist
./node_modules/.bin/tsc --build tsconfig.json