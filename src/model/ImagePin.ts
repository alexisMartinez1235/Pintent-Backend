import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../utils/database';
import User from './User';
import GeneralElement from './GeneralElement';

// import List from './List';

class ImagePin extends Model {
  // public modifyTask() {
  //   return 1;
  // }
}

ImagePin.init({
  // Model attributes are defined here
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references:{
      model: GeneralElement,
      key: 'id',
    }
  },
  image: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  // idList: {
  //   type: DataTypes.UUID,
  //   defaultValue: DataTypes.UUIDV4,
  //   references: {
  //     model: List,
  //     key: 'id',
  //   },
  // },
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'IMAGE_PIN', // We need to choose the model name
  timestamps: false, // disable creation date
});

ImagePin.sync();

export default ImagePin;
