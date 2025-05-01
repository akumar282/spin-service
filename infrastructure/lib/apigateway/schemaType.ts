import {
  CorsOptions,
  Integration,
  MethodOptions,
  ResourceOptions,
  RestApiProps,
} from 'aws-cdk-lib/aws-apigateway'

export type FullApiDefinition = {
  id: string
  props: RestApiProps
  defaultCorsPreflightOptions: CorsOptions | undefined
  resources: {
    pathPart: string
    options?: ResourceOptions
    methods: {
      method: string
      integration: Integration
      options?: MethodOptions
    }[]
  }[]
}

export type BaseApiDefinition = {
  id: string
  props: RestApiProps
  defaultCorsPreflightOptions: CorsOptions | undefined
}

export type ResourceDefinition = {
  resources: {
    pathPart: string
    options?: ResourceOptions
    methods: {
      method: string
      integration: Integration
      options?: MethodOptions
    }[]
  }[]
}
