#/bin/bash

sed -i "s/async function resolveCommand(commandName, context) {/async function resolveCommand(commandName, context) { if (commandName === 'node') commandName = 'deno';/g" node_modules/.deno/dax-sh@0.39.2/node_modules/dax-sh/esm/mod.js
