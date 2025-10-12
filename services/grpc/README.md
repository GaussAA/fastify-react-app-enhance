# 🔌 gRPC 服务配置

基于 gRPC 的微服务通信配置和示例。

## 📁 目录结构

```
services/grpc/
├── client/              # gRPC 客户端
│   ├── user.client.ts   # 用户服务客户端
│   └── index.ts         # 客户端入口
├── server/              # gRPC 服务端
│   ├── user.service.ts  # 用户服务实现
│   └── index.ts         # 服务端入口
├── proto/               # Protocol Buffers 定义
│   ├── user.proto       # 用户服务定义
│   └── common.proto     # 通用类型定义
└── README.md           # 本文档
```

## 🏗️ 技术栈

- **@grpc/grpc-js** - gRPC JavaScript 实现
- **@grpc/proto-loader** - Protocol Buffers 加载器
- **protobufjs** - Protocol Buffers 工具

## 📋 服务定义

### 用户服务 (User Service)

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  int64 created_at = 4;
  int64 updated_at = 5;
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUserResponse {
  User user = 1;
}

message UpdateUserRequest {
  string id = 1;
  string name = 2;
  string email = 3;
}

message UpdateUserResponse {
  User user = 1;
}

message DeleteUserRequest {
  string id = 1;
}

message DeleteUserResponse {
  bool success = 1;
}

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
pnpm install

# gRPC 相关依赖
pnpm add @grpc/grpc-js @grpc/proto-loader
pnpm add -D @types/google-protobuf
```

### 2. 生成类型定义

```bash
# 生成 TypeScript 类型定义
npx protoc --plugin=node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=services/grpc/generated \
  --ts_proto_opt=nestJs=true \
  services/grpc/proto/*.proto
```

### 3. 启动 gRPC 服务

```bash
# 启动 gRPC 服务端
cd services/grpc/server
node index.js

# 或使用 TypeScript
npx ts-node index.ts
```

### 4. 测试客户端

```bash
# 运行客户端测试
cd services/grpc/client
node index.js

# 或使用 TypeScript
npx ts-node index.ts
```

## 🔧 服务端实现

### 用户服务实现

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { UserService } from '../generated/user_grpc_pb';
import { User } from '../generated/user_pb';

class UserServiceImpl implements UserService {
  async getUser(
    call: grpc.ServerUnaryCall<GetUserRequest, GetUserResponse>,
    callback: grpc.sendUnaryData<GetUserResponse>
  ) {
    try {
      const { id } = call.request;

      // 从数据库获取用户
      const user = await this.getUserFromDatabase(id);

      const response = new GetUserResponse();
      response.setUser(user);

      callback(null, response);
    } catch (error) {
      callback(error, null);
    }
  }

  async createUser(
    call: grpc.ServerUnaryCall<CreateUserRequest, CreateUserResponse>,
    callback: grpc.sendUnaryData<CreateUserResponse>
  ) {
    try {
      const { name, email } = call.request;

      // 创建用户
      const user = await this.createUserInDatabase(name, email);

      const response = new CreateUserResponse();
      response.setUser(user);

      callback(null, response);
    } catch (error) {
      callback(error, null);
    }
  }

  private async getUserFromDatabase(id: string): Promise<User> {
    // 实现数据库查询逻辑
    const user = new User();
    user.setId(id);
    user.setName('John Doe');
    user.setEmail('john@example.com');
    user.setCreatedAt(Date.now());
    user.setUpdatedAt(Date.now());
    return user;
  }

  private async createUserInDatabase(
    name: string,
    email: string
  ): Promise<User> {
    // 实现数据库创建逻辑
    const user = new User();
    user.setId('user_' + Date.now());
    user.setName(name);
    user.setEmail(email);
    user.setCreatedAt(Date.now());
    user.setUpdatedAt(Date.now());
    return user;
  }
}

// 启动服务器
const server = new grpc.Server();
const packageDefinition = protoLoader.loadSync('../proto/user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

server.addService(userProto.UserService.service, new UserServiceImpl());

server.bindAsync(
  '0.0.0.0:50051',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error('Failed to start server:', err);
      return;
    }
    console.log(`gRPC server running on port ${port}`);
    server.start();
  }
);
```

## 🔌 客户端实现

### 用户服务客户端

```typescript
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const packageDefinition = protoLoader.loadSync('../proto/user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user as any;

class UserClient {
  private client: any;

  constructor() {
    this.client = new userProto.UserService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
  }

  async getUser(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.getUser({ id }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async createUser(name: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.createUser({ name, email }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}

// 使用示例
async function main() {
  const client = new UserClient();

  try {
    // 创建用户
    const createResponse = await client.createUser(
      'John Doe',
      'john@example.com'
    );
    console.log('Created user:', createResponse);

    // 获取用户
    const getResponse = await client.getUser(createResponse.user.id);
    console.log('Retrieved user:', getResponse);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 🧪 测试

### 单元测试

```bash
# 运行 gRPC 服务测试
cd services/grpc
pnpm run test

# 运行特定测试
pnpm run test:server
pnpm run test:client
```

### 集成测试

```bash
# 启动测试环境
docker-compose -f infrastructure/docker/docker-compose.test.yml up -d

# 运行集成测试
pnpm run test:integration
```

## 🔧 开发工具

### Protocol Buffers 编译

```bash
# 编译 proto 文件
protoc --js_out=import_style=commonjs,binary:generated \
  --grpc_out=grpc_js:generated \
  --plugin=protoc-gen-grpc=node_modules/.bin/grpc_tools_node_protoc_plugin \
  proto/*.proto
```

### 代码生成

```bash
# 生成 TypeScript 类型
npx protoc-gen-ts_proto --ts_proto_out=generated \
  --ts_proto_opt=nestJs=true \
  proto/*.proto
```

## 🚀 部署

### Docker 部署

```dockerfile
# Dockerfile.grpc
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 50051

CMD ["node", "server/index.js"]
```

### Kubernetes 部署

```yaml
# grpc-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: grpc-service
spec:
  selector:
    app: grpc-server
  ports:
    - port: 50051
      targetPort: 50051
  type: ClusterIP
```

## 📊 监控和日志

### 指标监控

- **请求数量**: 总请求数和成功率
- **响应时间**: 平均响应时间和延迟分布
- **错误率**: 错误请求比例
- **连接数**: 活跃连接数

### 日志记录

```typescript
import { Logger } from 'winston';

const logger = new Logger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'grpc.log' }),
  ],
});

// 在服务方法中使用
logger.info('gRPC request received', { method: 'getUser', id });
```

## 📚 相关文档

- [gRPC 官方文档](https://grpc.io/docs/)
- [Protocol Buffers 指南](https://developers.google.com/protocol-buffers)
- [Node.js gRPC 文档](https://grpc.io/docs/languages/node/)
- [微服务架构指南](../../docs/architecture/architecture.md)

## 🎯 最佳实践

1. **服务设计**: 遵循 RESTful 原则设计 gRPC 服务
2. **错误处理**: 使用标准的 gRPC 状态码
3. **版本控制**: 使用语义化版本控制 Protocol Buffers
4. **性能优化**: 使用流式处理处理大量数据
5. **安全**: 使用 TLS 加密和身份验证

---

_最后更新: 2025-01-27_
