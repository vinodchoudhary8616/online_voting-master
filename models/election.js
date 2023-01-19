"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Election extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static addElections({ electionName, adminID, publicurl }) {
      return this.create({
        electionName,
        publicurl,
        adminID,
      });
    }

    static modifyelection({ electionName, publicurl, electionid }) {
      return this.update(
        {
          electionName: electionName,
          publicurl: publicurl,
        },
        {
          where: {
            id: electionid,
          },
        }
      );
    }

    static getPublicurl(publicurl) {
      return this.findOne({
        where: {
          publicurl,
        },
      });
    }

    static removeelection(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    static getElectionurl(publicurl) {
      return this.findOne({
        where: {
          publicurl,
        },
        order: [["id", "ASC"]],
      });
    }
    static getElection(adminID) {
      return this.findOne({
        where: {
          adminID,
        },
        order: [["id", "ASC"]],
      });
    }
    static getElections(adminID) {
      return this.findAll({
        where: {
          adminID,
        },
        order: [["id", "ASC"]],
      });
    }

    static findelection(electionName, publicurl) {
      return this.findOne({
        where: {
          electionName: electionName,
          publicurl: publicurl,
        },
      });
    }
    static retriveelection(electionID, adminid) {
      return this.findOne({
        where: {
          id: electionID,
          adminID: adminid,
        },
      });
    }

    static launch(id) {
      return this.update(
        {
          launched: true,
          ended: false,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }
    static end(id) {
      return this.update(
        {
          launched: false,
          ended: true,
        },
        {
          where: {
            id: id,
          },
        }
      );
    }

    static associate(models) {
      // define association here
      Election.belongsTo(models.Admin, {
        foreignKey: "adminID",
        onDelete: "CASCADE",
      });
      Election.hasMany(models.questions, {
        foreignKey: "electionID",
        onDelete: "CASCADE",
      });
      Election.hasMany(models.Voters, {
        foreignKey: "electionID",
        onDelete: "CASCADE",
      });
    }
  }
  Election.init(
    {
      electionName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      launched: DataTypes.BOOLEAN,
      ended: DataTypes.BOOLEAN,
      publicurl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Election",
    }
  );
  return Election;
};
