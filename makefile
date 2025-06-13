ifneq ($(ENV),)
    include .env.$(ENV)
else
    include .env.default
endif
export

STACKS = SpinCompute-prod SpinServiceStack-prod

bootstrap:
	cdk bootstrap

install:
	npm ci

build:
	npm run build

deploy:
	npm run cdk -- deploy $(STACK_NAME)-$(ENV)

deploy-all:
	npm run cdk -- deploy ${STACKS}

synth-all: 
	npm run cdk -- synth ${STACKS}

synth:
	npm run cdk -- synth $(STACK_NAME)-$(ENV)

diff:
	npm run cdk -- diff $(STACK_NAME)-$(ENV)

destroy:
	npm run cdk -- destroy $(STACK_NAME)-$(ENV)

meta:
	cdk metadata --name SpinServiceStack

buildDiff: build diff

buildDeploy: build deploy

buildSynth: build synth