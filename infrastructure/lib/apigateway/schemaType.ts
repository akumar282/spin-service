import {
  Integration,
  MethodOptions,
  ResourceOptions,
  RestApiProps,
} from 'aws-cdk-lib/aws-apigateway'

export type ResourceDefinition = {
  pathPart: string
  options?: ResourceOptions
  methods?: {
    method: string
    integration: Integration
    options?: MethodOptions
  }[]
  resources?: ResourceDefinition[]
}

export type FullApiDefinition = {
  id: string
  props: RestApiProps
  resources: ResourceDefinition[]
}

export type BaseApiDefinition = {
  id: string
  props: RestApiProps
}
