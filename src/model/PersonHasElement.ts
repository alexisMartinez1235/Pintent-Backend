import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../utils/database';
import Person from './Person';
import List from './List';

class PersonHasElement extends Model {}

PersonHasElement.init(
  {
    // Model attributes are defined here
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
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'PERSON_HAS_ELEMENT', // We need to choose the model name
    timestamps: false, // disable creation date
  }
);

Person.hasMany(PersonHasElement, {
  foreignKey: {
    name: 'emailPerson',
    allowNull: false,
  },
});
PersonHasElement.belongsTo(Person, {
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
  foreignKey: {
    name: 'emailPerson',
    allowNull: false,
  },
});

// PersonHasList.sync({ force: true });
PersonHasElement.sync()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

export default PersonHasElement;
