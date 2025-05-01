import {
  BaseApiDefinition,
  FullApiDefinition,
  ResourceDefinition,
} from './schemaType'
import { Construct } from 'constructs'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import { IResource, Resource, RestApi } from 'aws-cdk-lib/aws-apigateway'

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
      this.generateResources(definition.resources)
    }
  }

  private generateResources(
    schema: ResourceDefinition[],
    parentNode: Resource | IResource = this.api.root
  ) {
    const resources = schema
    for (const resource of resources) {
      const newRec = parentNode.addResource(resource.pathPart, resource.options)
      if (resource.methods) {
        const methods = resource.methods
        for (const method of methods) {
          newRec.addMethod(method.method, method.integration, method.options)
        }
      }
      this.resources.push(newRec)
      if (resource.resources) {
        this.generateResources(
          resource.resources,
          this.resources[resources.length - 1]
        )
      }
    }
  }

  public addResources(resources: ResourceDefinition[]) {
    this.generateResources(resources)
  }
}
