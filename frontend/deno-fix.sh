#/bin/bash

find .output -type f -name "*.mjs" -print0 | xargs -0 sed -i "s/import 'fs';/import 'node:fs';/g"
find .output -type f -name "*.mjs" -print0 | xargs -0 sed -i "s/import 'path';/import 'node:path';/g"
find .output -type f -name "*.mjs" -print0 | xargs -0 sed -i "s/from 'fs';/from 'node:fs';/g"
find .output -type f -name "*.mjs" -print0 | xargs -0 sed -i "s/from 'path';/from 'node:path';/g"

rm -f .output/server/package.json
