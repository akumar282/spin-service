import {
  HttpApi as ApiHttp,
  AddRoutesOptions,
  HttpApiProps,
} from 'aws-cdk-lib/aws-apigatewayv2'
import { Construct } from 'constructs'

export type ResourceDefinition = {
  definition: AddRoutesOptions[]
}

export type HttpDefinition = {
  id: string
  definition: HttpApiProps
  routes?: ResourceDefinition
}

export class HttpApi {
  public httpApi: ApiHttp
  public url: string

  constructor(scope: Construct, props: HttpDefinition) {
    this.httpApi = new ApiHttp(scope, props.id, props.definition)
    this.url = this.httpApi.url ? this.httpApi.url : 'No default stage'

    if (props.routes) {
      this.generateRoutes(props.routes)
    }
  }

  private generateRoutes(schema: ResourceDefinition) {
    const routes = schema.definition
    for (const route of routes) {
      this.httpApi.addRoutes(route)
    }
  }

  public addRoutes(routes: ResourceDefinition) {
    this.generateRoutes(routes)
  }
}
