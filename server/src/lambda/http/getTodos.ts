import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import cors from '@middy/http-cors'

import { getAllTodos } from '../../businessLogic/todos'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const todos= await getAllTodos(jwtToken)
    
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
    },
      body: JSON.stringify({
          "items": todos, 
      })
      } 

  })

handler.use(
  cors({
    credentials: true
  })
)
