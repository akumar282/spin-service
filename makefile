ifneq ($(ENV),)
    include .env.$(ENV)
else
    include .env.default
endif
export

install:
	npm ci

build:
	npm run build

deploy:
	npm run cdk -- deploy $(ENV)-$(STACK_NAME) \
	--output cdk_stack/$(ENV)-$(STACK_NAME)

synth:
	npm run cdk -- synth $(ENV)-$(STACK_NAME) \
    --output cdk_stack/$(ENV)-$(STACK_NAME)

diff:
	npm run cdk -- diff $(ENV)-$(STACK_NAME) \
	--output cdk_stack/$(ENV)-$(STACK_NAME)

destroy:
	npm run cdk -- destroy $(ENV)-$(STACK_NAME) \
    --output cdk_stack/$(ENV)-$(STACK_NAME)

meta:
	cdk metadata --name SpinServiceStack

buildDiff: build diff

buildDeploy: build deploy

buildSynth: build synth