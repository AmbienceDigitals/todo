import type { AWS } from '@serverless/typescript';
import {GetTodos, CreateTodo, UpdateTodo, DeleteTodo, GenerateUploadUrl} from '@lambda/http';
import {Auth} from '@lambda/auth';

const serverlessConfiguration: AWS = {
  // org: 'ambience',
  // app: 'serverless-todo-application',
  service: 'todo',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild',
  'serverless-aws-documentation', 
  'serverless-reqvalidator-plugin',
  'serverless-plugin-canary-deployments',
  'serverless-iam-roles-per-function',],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },

    // X-Ray tracing 
    tracing: {
      lambda: true,
      apiGateway: true,
    },

    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TODOS_TABLE: 'serverlesstodo-${self:custom.stage}',
      TODOS_CREATED_AT_INDEX: 'CreatedAtIndex',
      ATTACHMENT_S3_BUCKET: 'serverlesstodo-${self:custom.stage}',
      SIGNED_URL_EXPIRATION: '300'
    },
  },

  // import the function via paths
  functions: { Auth, CreateTodo, GetTodos, DeleteTodo, UpdateTodo, GenerateUploadUrl },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    stage: '${opt:stage, "dev"}',
    region: '${opt:region, "us-east-1"}',

    // AWS documentation for API
    documentation: {
      api: {
        // API documentation info
        info: {
          version: 'v1.0.0',
          title: 'Udagram Todo Application',
          description: 'Serverless application for creating todo lists with image sharing option'
        }
      },

      // model defining database schema
      models: [
        {
          name: 'TodoRequest',
          contentType: 'application/json',
          schema: '${file(models/create-todo-model.json)}'
        },
        {
          name: 'UpdateRequest',
          contentType: 'application/json',
          schema: '${file(models/update-todo-model.json)}'
        }
      ]
    },
  },

  // resources declaration 
  resources: {
    Resources: {
      // API Gateway validator for post requests
      RequestBodyValidator: {
        Type: "AWS::ApiGateway::RequestValidator",
        Properties: {
          Name: 'request-body-validator',
          RestApiId: {
            Ref:'ApiGatewayRestApi',
          },
          ValidateRequestBody: true,
          ValidateRequestParameters: false,
        }
      },

      GatewayResponseDefault4XX: {
        Type: "AWS::ApiGateway::GatewayResponse",
        Properties: {
          ResponseParameters: {
            "gatewayresponse.header.Access-Control-Allow-Origin": "'*'",
            "gatewayresponse.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "gatewayresponse.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'"
          },
          ResponseType: "DEFAULT_4XX",
          RestApiId: {
            "Ref": "ApiGatewayRestApi"
          }
        }
      },

      // creating todo table and image index
      TodosTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          AttributeDefinitions: [
          {
            AttributeName: "userId",
            AttributeType: "S",
          },
          {
            AttributeName: "todoId",
            AttributeType: "S",
          },
          {
            AttributeName: "createdAt",
            AttributeType: "S",
          }
        ],
          KeySchema: [
          {
            AttributeName: "userId",
            KeyType: "HASH"
          },
          {
            AttributeName: "todoId",
            KeyType: "RANGE"
          },
        ],
          BillingMode: 'PAY_PER_REQUEST',
          TableName: '${self:provider.environment.TODOS_TABLE}',
          LocalSecondaryIndexes: [
            {
              IndexName: "${self:provider.environment.TODOS_CREATED_AT_INDEX}",
              KeySchema: [
                {
                  AttributeName: "userId",
                  KeyType: "HASH"
                },
                {
                  AttributeName: "createdAt",
                  "KeyType": "RANGE"
                }
              ],
              Projection: {
                ProjectionType: "ALL"
              }
            }
          ]
        } 
      },
      
      // image bucket
      AttachmentsBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "${self:provider.environment.ATTACHMENT_S3_BUCKET}",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: [
                  "*"
                ],
                AllowedHeaders: [
                  "*"
                ],
                AllowedMethods: [
                  "GET",
                  "PUT",
                  "POST",
                  "DELETE",
                  "HEAD"
                ],
                MaxAge: 3000
              }
            ]
          }
        }
      },

      // image bucket policy
      BucketPolicy: {
        Type: 'AWS::S3::BucketPolicy',
        Properties: {
          PolicyDocument: {
            Id: 'MyPolicy',
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicReadForGetBucketObjects',
                Effect: 'Allow',
                Principal: '*',
                Action: [
                  's3:GetObject',
                  's3:PutObject',
                ],
                Resource: 'arn:aws:s3:::${self:provider.environment.ATTACHMENT_S3_BUCKET}/*'
              }
            ]
          },
          Bucket: {
            "Ref": 'AttachmentsBucket'
          }
        }
      },
    }
  }
};

module.exports = serverlessConfiguration;
