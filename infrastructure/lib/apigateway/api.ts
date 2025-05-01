import {
  BaseApiDefinition,
  FullApiDefinition,
  ResourceDefinition,
} from './schemaType'
import { Construct } from 'constructs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { Resource, RestApi } from 'aws-cdk-lib/aws-apigateway'

export class Api {
  public api: RestApi
  readonly resources: Resource[]

  constructor(
    scope: Construct,
    definition: FullApiDefinition | BaseApiDefinition
  ) {
    const { props } = definition
    this.api = new apigateway.RestApi(scope, definition.id, {
      restApiName: props.restApiName,
      description: props.description,
      defaultCorsPreflightOptions: props.defaultCorsPreflightOptions,
    })

    this.resources = []

    if ('resources' in definition) {
      this.generateResources(definition)
    }
  }

  private generateResources(schema: ResourceDefinition) {
    const resources = schema.resources
    for (const resource of resources) {
      const newRec = this.api.root.addResource(
        resource.pathPart,
        resource.options
      )
      if (resource.methods) {
        const methods = resource.methods
        for (const method of methods) {
          newRec.addMethod(method.method, method.integration, method.options)
        }
      }
      this.resources.push(newRec)
    }
  }

  public addResources(resources: ResourceDefinition) {
    this.generateResources(resources)
  }
}
