import * as uuid from 'uuid'
import { TodoItem, TodoUpdate } from '../models'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest, UpdateTodoRequest } from '../requests'
import { getUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

// get all todos using the todo access class
export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = getUserId(jwtToken)
  return todoAccess.getAllTodos(userId)
}

// create todo item using todo access class
export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = getUserId(jwtToken)
  const bucketName =  process.env.ATTACHMENT_S3_BUCKET

  return  todoAccess.createTodo({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`,
    ...createTodoRequest,
  })
}

// create todo item using todo access class
export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  itemId: string,
  jwtToken: string
): Promise<TodoUpdate> {
  const userId = getUserId(jwtToken)
  return  todoAccess.updateTodo(
    updateTodoRequest, itemId, userId
  )
}

// delete todo item
export async function generateUploadUrl (itemId: string): Promise<string> {
  return todoAccess.generateUploadUrl(itemId);
}

// delete todo item
export async function deleteTodo (itemId: string, jwtToken:string): Promise<any> {
  const userId = getUserId(jwtToken);
  return todoAccess.deleteTodo(itemId, userId);
}
