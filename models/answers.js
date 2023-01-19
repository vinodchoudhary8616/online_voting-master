"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class answers extends Model {
    static addResponse({ voterid, ElectionID, questionID, chossedoption }) {
      return this.create({
        ElectionID,
        questionID,
        voterid,
        chossedoption,
      });
    }

    static retriveanswers(ElectionID) {
      return this.findAll({
        where: {
          ElectionID,
        },
      });
    }

    static retrivecountoptions(chossedoption, ElectionID, questionID) {
      return this.count({
        where: {
          chossedoption,
          ElectionID,
          questionID,
        },
      });
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      answers.belongsTo(models.Election, {
        foreignKey: "ElectionID",
      });

      answers.belongsTo(models.questions, {
        foreignKey: "questionID",
      });

      answers.belongsTo(models.Voters, {
        foreignKey: "voterid",
        onDelete: "CASCADE",
      });
      answers.belongsTo(models.options, {
        foreignKey: "chossedoption",
        onDelete: "CASCADE",
      });

      // define association here
    }
  }
  answers.init(
    {},
    {
      sequelize,
      modelName: "answers",
    }
  );
  return answers;
};
