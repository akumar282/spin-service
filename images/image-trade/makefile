ifneq ($(ENV),)
    include .env.$(ENV)
else
    include .env.default
endif
export

build:

deploy:
	npx esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js --external:playwright --external:playwright-core

run:
	node dist/index.js

test:
	npm run test


show: deploy run
