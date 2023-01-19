"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("answers", "ElectionID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("answers", {
      fields: ["ElectionID"],
      type: "foreign key",
      references: {
        table: "Elections",
        field: "id",
      },
    });

    await queryInterface.addColumn("answers", "questionID", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("answers", {
      fields: ["questionID"],
      type: "foreign key",
      references: {
        table: "questions",
        field: "id",
      },
    });
    await queryInterface.addColumn("answers", "voterid", {
      type: Sequelize.DataTypes.INTEGER,
    });
    await queryInterface.addConstraint("answers", {
      fields: ["voterid"],
      type: "foreign key",
      references: {
        table: "Voters",
        field: "id",
      },
    });

    await queryInterface.addColumn("answers", "chossedoption", {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    });
    await queryInterface.addConstraint("answers", {
      fields: ["chossedoption"],
      type: "foreign key",
      references: {
        table: "options",
        field: "id",
      },
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn("answers", "voterid");
    await queryInterface.removeColumn("answers", "ElectionID");
    await queryInterface.removeColumn("answers", "questionID");
    await queryInterface.removeColumn("answers", "chossedoption");
  },
};
