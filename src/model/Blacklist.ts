import {
  // Client,
  Entity,
  Repository,
  // Repository,
  Schema,
} from 'redis-om'
import { clientRedis } from '../utils/database';


/* our entity */
class Blacklist extends Entity {}

/* create a Schema for Person */
const blackListSchema = new Schema(Blacklist, {
  token: { type: 'string' },
  // token
}, {
  dataStructure: 'JSON'
});

/* use the client to create a Repository just for Blacklist */
async function blackListRepository(): Promise<Repository<Blacklist>>{
  const client = await clientRedis();
  const blackListRepository: Repository<Blacklist> = client
    .fetchRepository(blackListSchema);

  /* create the index for Blacklist */
  // console.log("ping2");
  // console.log(client.execute(['PING']));

  await blackListRepository.createIndex();
  
  return blackListRepository;
}

export {
  Blacklist,
  blackListSchema,
  blackListRepository,
};
 