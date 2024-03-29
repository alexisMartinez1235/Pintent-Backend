import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../utils/database';
import Person from './Person';
// import List from './List';

class GeneralElement extends Model {
  // public modifyTask() {
  //   return 1;
  // }
}

GeneralElement.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    archivied: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    email: {
      type: DataTypes.STRING(30),
      allowNull: false,
      references: {
        model: Person,
        key: 'email',
      },
    },
    // idList: {
    //   type: DataTypes.UUID,
    //   defaultValue: DataTypes.UUIDV4,
    //   references: {
    //     model: List,
    //     key: 'id',
    //   },
    // },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'GENERAL_ELEMENT', // We need to choose the model name
    timestamps: false, // disable creation date
  }
);

GeneralElement.sync()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

export default GeneralElement;
