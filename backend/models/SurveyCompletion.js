const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurveyCompletion = sequelize.define('SurveyCompletion', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    surveyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Surveys', key: 'id' },
    },
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'surveyId'] },
    ],
  });

  return SurveyCompletion;
};
