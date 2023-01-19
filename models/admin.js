"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static updatepassword(password, email) {
      return this.update(
        {
          password: password,
        },
        {
          where: {
            email: email,
          },
        }
      );
    }
    static findadmin(email) {
      return this.findOne({
        where: {
          email,
        },
      });
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.hasMany(models.Election, {
        foreignKey: "adminID",
      });
    }
  }
  Admin.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      case: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  return Admin;
};
