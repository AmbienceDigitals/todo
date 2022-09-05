import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Types } from 'aws-sdk/clients/s3';
import { TodoItem, TodoUpdate } from '../models'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3Client: Types = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  // get todos
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos')
    // querying Dynamodb table to return todo items
    const result = await this.docClient.query({
      TableName: this.todoTable,
      // condition key to return todo items 
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
          ":userId": userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  // create todo item
  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    // using docClient to create todoItem
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem as TodoItem
  }

  // delete todo item
  async deleteTodo(userId: string, todoId: string): Promise<any> {
    // using docClient to delete todo item 
    await this.docClient.delete({
      TableName: this.todoTable,
      // key parameters for deletion of todo item
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise()
    return ""

  }
  

    // update todo item
    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
      // using docClient to update todo item 
      const result = await this.docClient.update({
        TableName: this.todoTable,
        // key parameter for making updates 
        Key: {
          "userId": userId,
          "todoId": todoId
        },
        UpdateExpression: "set #a = :a, #b = :b, #c = :c",
        // setting Expression attributes values
        ExpressionAttributeValues: {
            ":a": todoUpdate['name'],
            ":b": todoUpdate['dueDate'],
            ":c": todoUpdate['done']
        },
        ReturnValues: "ALL_NEW"
        }).promise()
  
      const update = result.Attributes

      return update as TodoUpdate
    }

      // upload url from s3
  async generateUploadUrl(todoId: string): Promise<string> {
    // using s3Client to get signed url
    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration)
      })
      return url as string
    }
  }


