import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { Types } from 'aws-sdk/clients/s3';
import { TodoItem, TodoUpdate } from '../models'
import * as AWSXRay from 'aws-xray-sdk'
import {createLogger} from '../utils/logger';

const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('Access')
export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly todoIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  // get todos
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')
    // querying Dynamodb table to return todo items
    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: this.todoIndex,
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
    logger.info('Creating a todo item: ', todoItem.todoId)
    // using docClient to create todoItem
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todoItem
    }).promise()

    return todoItem as TodoItem
  }

  // delete todo item
  async deleteTodo(userId: string, todoId: string): Promise<any> {
    logger.info('deleting todo item: ', todoId)
    // using docClient to delete todo item 
    await this.docClient.delete({
      TableName: this.todoTable,
      // key parameters for deletion of todo item
      Key: {
        "todoId": todoId,
        "userId": userId
      }
    }).promise()
    return "" as string
  }
  

    // update todo item
    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
      logger.info('Updating todo item: ', todoId)
      // using docClient to update todo item 
      const result = await this.docClient.update({
        TableName: this.todoTable,
        // key parameter for making updates 
        Key: {
          "userId": userId
,          "todoId": todoId
        },
        UpdateExpression: "set #a = :a, dueDate = :b, done = :c",
        ExpressionAttributeNames: { '#a': 'name' },
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
  async generateUploadUrl(todoId: string): Promise<any> {
    logger.info('generate uploadUrl: ', todoId)
    // using s3Client to get signed url
    const url = await this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: parseInt(this.urlExpiration)
      })
      return url as string
    }
  }


