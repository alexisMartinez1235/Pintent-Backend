import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../utils/database';
import Person from './Person';
import List from './List';

class UserHasElement extends Model {
}

UserHasElement.init({
  // Model attributes are defined here
  emailPerson: {
    type: DataTypes.STRING(30),
    allowNull: false,
    primaryKey: true,
    references: {
      model: Person,
      key: 'email',
    },
  },
  idList: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    references: {
      model: List,
      key: 'id',
    },
  },
  isOwner: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  canRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  canWrite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'PERSON_HAS_ELEMENT', // We need to choose the model name
  timestamps: false, // disable creation date
});

// PersonHasList.sync({ force: true });
UserHasElement.sync();

export default UserHasElement;
