import { Sequelize } from '@sequelize/core';
import fs from 'fs';

const password = fs.readFileSync('/run/secrets/mysql_db_pw', 'utf8').replace('\n', '');

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
  },
);

export const mongo_uri = `mongodb://root:${password}@mongo:27017/?authMechanism=DEFAULT`;
export const mongoSessionCollectionName = 'mySessions';
