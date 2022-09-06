import { handlerPath } from '@libs/handler-resolver';

// getTodos function
export const GetTodos = {
    handler: `${handlerPath(__dirname)}/getTodos.handler`,
    events: [
        {
        http: {
            method: 'get',
            path: 'todos',
            cors: true,
            authorizer: 'Auth'
        },
        },
    ],
    // i am role statement
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                "dynamodb:Query"
            ],
            Resource: [
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}',
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_CREATED_AT_INDEX}',
            ]
        },
        {
            Effect: 'Allow',
            Action: [
                "xray: PutTraceSegments"
            ],
            Resource: '*'
        },

    ]
};

// create todos function
export const CreateTodo = {
    handler: `${handlerPath(__dirname)}/createTodo.handler`,
    events: [
        {
        http: {
            method: 'post',
            path: 'todos',
            cors: true,
            authorizer: 'Auth',
            reqValidatorName: 'RequestBodyValidator',
            documentation: {
                summary: 'Create a new todo item ',
                description: 'creating todo item',
                requestModels: {
                    'application/json': 'TodoRequest'
                    }
                }
            },
        },
    ],
    // i am role statement
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                "dynamodb:PutItem"
            ],
            Resource: [
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}',
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_CREATED_AT_INDEX}',
            ]
        },
        {
            Effect: 'Allow',
            Action: [
                "xray: PutTraceSegments"
            ],
            Resource: '*'
        },

    ]
};

// delete todos function
export const DeleteTodo = {
    handler: `${handlerPath(__dirname)}/deleteTodo.handler`,
    events: [
        {
        http: {
            method: 'delete',
            path: 'todos/{todoId}',
            cors: true,
            authorizer: 'Auth',
            }
        }
    ],
    // i am role statement
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                "dynamodb:DeleteItem"
            ],
            Resource: [
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}',
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_CREATED_AT_INDEX}',
            ]
        },
        {
            Effect: 'Allow',
            Action: [
                "xray: PutTraceSegments"
            ],
            Resource: '*'
        },

    ]
};

// update Todo function
export const UpdateTodo = {
    handler: `${handlerPath(__dirname)}/updateTodo.handler`,
    events: [
        {
        http: {
            method: 'patch',
            path: 'todos/{todoId}', 
            cors: true,
            reqValidatorName: 'RequestBodyValidator',
            documentation: {
                summary: 'update a todo item ',
                description: 'update todo item',
                requestModels: {
                    'application/json': 'UpdateRequest'
                }
            }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        },
        },
    ],
    // i am role statement
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                "dynamodb:UpdateItem"
            ],
            Resource: [
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}',
                'arn:aws:dynamodb:${self:custom.region}:*:table/${self:provider.environment.TODOS_TABLE}/index/${self:provider.environment.TODOS_CREATED_AT_INDEX}',
            ]
        },
        {
            Effect: 'Allow',
            Action: [
                "xray: PutTraceSegments"
            ],
            Resource: '*'
        },

    ]
};

// generate Signed URL
export const GenerateUploadUrl = {
    handler: `${handlerPath(__dirname)}/generateUploadUrl.handler`,
    events: [
        {
        http: {
            method: 'post',
            path: 'todos/{todoId}/attachment',
            cors: true,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
        },
        },
    ],
    // i am role statement
    iamRoleStatements: [
        {
            Effect: 'Allow',
            Action: [
                "s3: *",
            ],
            Resource: 'arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*'
        },
        {
            Effect: 'Allow',
            Action: [
                "xray: PutTraceSegments"
            ],
            Resource: '*'
        },
    ]
};
