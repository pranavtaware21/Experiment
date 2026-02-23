const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Title is required' } },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Platform is required' } },
    },
    surveyLink: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: { args: [1], msg: 'Duration must be at least 1' } },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    responses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isBuiltIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    questions: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    logicRules: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    pages: {
      type: DataTypes.JSONB,
      defaultValue: [],
    },
    endMessage: {
      type: DataTypes.TEXT,
      defaultValue: 'Thank you for completing this survey!',
    },
  }, {
    timestamps: true,
  });

  return Survey;
};
