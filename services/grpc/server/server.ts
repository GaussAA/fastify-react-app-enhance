import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, 'proto', 'user.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj: any = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObj.user;

function GetUser(call: any, callback: any) {
  const id = call.request.id;
  callback(null, { id, name: 'Alice', email: 'alice@example.com' });
}

function main() {
  const server = new grpc.Server();
  server.addService(userPackage.UserService.service, { GetUser });
  const addr = '0.0.0.0:50051';
  server.bindAsync(addr, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('gRPC server running on ' + addr);
  });
}

main();
