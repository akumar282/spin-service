import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import ListNode from "./src/other";
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);
  const what = new ListNode(3, null)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world', what
    }),
  };
};

//test code