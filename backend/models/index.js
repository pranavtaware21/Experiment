const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = require('./User')(sequelize);
const Survey = require('./Survey')(sequelize);
const SurveyCompletion = require('./SurveyCompletion')(sequelize);
const SurveyResponse = require('./SurveyResponse')(sequelize);

// Associations
User.hasMany(Survey, { foreignKey: 'ownerId', as: 'surveys' });
Survey.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.belongsToMany(Survey, { through: SurveyCompletion, foreignKey: 'userId', as: 'completedSurveys' });
Survey.belongsToMany(User, { through: SurveyCompletion, foreignKey: 'surveyId', as: 'completers' });

Survey.hasMany(SurveyResponse, { foreignKey: 'surveyId', as: 'surveyResponses' });
SurveyResponse.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

module.exports = { sequelize, User, Survey, SurveyCompletion, SurveyResponse };
