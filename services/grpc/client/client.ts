import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.join(__dirname, 'proto', 'user.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj: any = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObj.user;

function main() {
  const client = new userPackage.UserService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );
  client.GetUser({ id: 1 }, (err: any, resp: any) => {
    if (err) return console.error(err);
    console.log('gRPC response:', resp);
  });
}

main();
