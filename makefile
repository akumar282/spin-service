ifneq ($(ENV),)
    include .env.$(ENV)
else
    include .env.default
endif
export

STACKS = CertificateStack-prod SpinCompute-prod SpinClientStack-prod SpinServiceStack-prod

bootstrap:
	cdk bootstrap

install:
	npm ci

build:
	npm run build

build-all:
	npm run build-all

deploy:
	npm run cdk deploy --exclusively SpinClientStack-prod

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

bootstrap:
	cdk bootstrap

buildDiff: build diff

buildDeploy: build deploy-all

buildDeployAll: build-all deploy-all

buildSynth: build synth-all