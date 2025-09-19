export const generatePolicy = (sub: string, effect: string, method: string) => {
  return {
    principalId: sub,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: method,
        },
      ],
    },
    context: {
      userId: sub,
    },
  }
}
