#!/bin/bash

if [ -e $1 ]; then
	node ./config/seed.js
	mocha $1
else
	node ./config/seed.js
	mocha test/projects.js
fi
