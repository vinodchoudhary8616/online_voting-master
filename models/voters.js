"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Voters extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Voters.belongsTo(models.Election, {
        foreignKey: "electionID",
        onDelete: "CASCADE",
      });
      Voters.hasMany(models.answers, {
        foreignKey: "voterid",
        onDelete: "CASCADE",
      });
    }
    static add(Voterid, password, electionID) {
      return this.create({
        voterid: Voterid,
        voted: false,
        password: password,
        electionID: electionID,
      });
    }

    static modifypassword(Voterid, newpassword) {
      return this.update(
        {
          password: newpassword,
        },
        {
          where: {
            voterid: Voterid,
          },
        }
      );
    }

    static retrivevoters(electionID) {
      return this.findAll({
        where: {
          electionID,
        },
      });
    }
    static countvoters(electionID) {
      return this.count({
        where: {
          electionID,
        },
      });
    }
    static votersvoted(electionID) {
      return this.count({
        where: {
          electionID,
          voted: true,
        },
      });
    }

    static votersnotvoted(electionID) {
      return this.count({
        where: {
          electionID,
          voted: false,
        },
      });
    }
    static findVoter(id) {
      return this.findOne({
        where: {
          id,
        },
      });
    }

    static removevoter(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }

    static votecompleted(id) {
      return this.update(
        {
          voted: true,
        },
        {
          where: {
            id,
          },
        }
      );
    }
  }
  Voters.init(
    {
      voterid: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      voted: DataTypes.BOOLEAN,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      case: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Voters",
    }
  );
  return Voters;
};
