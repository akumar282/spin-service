deploy:
	esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js

run:
	node dist/index.js

buildDeploy:
	esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js && node dist/index.js
