import { DataTypes, Model } from '@sequelize/core';
import bcrypt from 'bcrypt';
import { sequelize } from '../utils/database';

class Person extends Model {
  public static async hashPassword(pw: string): Promise<string> {
    return bcrypt.hashSync(pw, await bcrypt.genSalt(10));
  }
}

Person.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING(30),
      get(): String | undefined {
        const email: String | undefined = this.getDataValue('email');
        if (email === undefined) return email;

        return email.toString().toLowerCase();
      },
      set(email: String) {
        this.setDataValue('email', email.toLowerCase());
      },
      allowNull: false,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'PERSON', // We need to choose the model name
    timestamps: false, // disable creation date
  }
);

// Person.sync({ force: true });
Person.sync()
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

export default Person;
