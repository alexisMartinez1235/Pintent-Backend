import { Sequelize } from '@sequelize/core';
import { Client } from 'redis-om';
import fs from 'fs';

const password = fs.readFileSync('/run/secrets/mysql_db_pw', 'utf8').replace('\n', '');

// mysql config
// eslint-disable-next-line import/prefer-default-export
export const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'env db var not found',
  process.env.MYSQL_USER || 'env user var not found',
  password,
  {
    host: 'mysql',
    port: 3306,
    dialect: 'mysql',
    define: {
      freezeTableName: true, // for make singular table name
    },
  }
);

//mongo config
export const mongo_uri = `mongodb://root:${password}@mongo:27017/?authMechanism=DEFAULT`;
export const mongoSessionCollectionName = 'mySessions';

// redis config
const redisURI: string = 'redis://:jiqopvnzuwng@redis:6379';
// const redisClient: Promise<Client> = client.open(redisURI);
// (async () => {
//   console.log(await redisClient.execute(['PING']));
//   return redisClient;
// })();

async function clientRedis(): Promise<Client> {
  const redisURI: string = 'redis://:jiqopvnzuwng@redis:6379';
  const client: Client = new Client();
  await client.open(redisURI);

  // console.log("ping1");
  // console.log(await client.execute(['PING']));

  return client;
}

export { redisURI, clientRedis };
