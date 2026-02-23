const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SurveyResponse = sequelize.define('SurveyResponse', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    surveyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Surveys', key: 'id' },
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return SurveyResponse;
};
