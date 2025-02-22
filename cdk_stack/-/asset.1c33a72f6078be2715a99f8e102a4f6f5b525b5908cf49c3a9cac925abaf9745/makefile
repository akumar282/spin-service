ifneq ($(ENV),)
    include .env.$(ENV)
else
    include .env.default
endif
export

build:

deploy:
	esbuild index.ts --bundle --minify --sourcemap --platform=node --target=es2020 --outfile=dist/index.js


test:
	npm run test