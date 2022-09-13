import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../utils/database';
// import GeneralElement from './GeneralElement';

class List extends Model {}

List.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      // references:{
      //   model: GeneralElement,
      //   key: 'id',
      // },
      defaultValue: DataTypes.UUIDV4,
    },
    listName: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    inTrash: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'LIST', // We need to choose the model name
    timestamps: false, // disable creation date
  }
);
List.sync()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

export default List;
