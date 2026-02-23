const express = require('express');
const { Op } = require('sequelize');
const { sequelize, Survey, User, SurveyCompletion, SurveyResponse } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/surveys — list active surveys where owner can afford responses, ranked by karma DESC
router.get('/', async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      where: { isActive: true },
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'karma'] }],
      order: [
        [{ model: User, as: 'owner' }, 'karma', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    // Filter out surveys where owner karma < survey duration (survey is "offline")
    const liveSurveys = surveys.filter((s) => s.owner.karma >= s.duration);

    res.json({ surveys: liveSurveys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/surveys/my — get current user's surveys with karma status
router.get('/my', auth, async (req, res) => {
  try {
    const surveys = await Survey.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    // Attach karma-based status to each survey
    const userKarma = req.user.karma;
    const surveysWithStatus = surveys.map((s) => {
      const data = s.toJSON();
      data.canAfford = userKarma >= s.duration;
      data.responsesRemaining = Math.floor(userKarma / s.duration);
      data.karmaCostPerResponse = s.duration;
      return data;
    });

    res.json({ surveys: surveysWithStatus, karma: userKarma });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/surveys — create a new survey (external link)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, surveyLink, duration, platform } = req.body;

    const survey = await Survey.create({
      title,
      description,
      surveyLink,
      duration,
      platform,
      ownerId: req.user.id,
    });

    await survey.reload({
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'karma'] }],
    });

    res.status(201).json({ survey });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/surveys/builder — create a built-in survey
router.post('/builder', auth, async (req, res) => {
  try {
    const { title, description, questions, pages, logicRules, endMessage, duration } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Survey title is required' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    const survey = await Survey.create({
      title,
      description: description || '',
      questions,
      pages: pages || [],
      logicRules: logicRules || [],
      endMessage: endMessage || 'Thank you for completing this survey!',
      duration: duration || 5,
      platform: 'surveyswap',
      isBuiltIn: true,
      ownerId: req.user.id,
    });

    // Set the surveyLink to the public URL
    await survey.update({ surveyLink: `/survey/${survey.id}` });

    await survey.reload({
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'karma'] }],
    });

    res.status(201).json({ survey });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map((e) => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/surveys/:id/public — get survey for public respondent view (no auth)
router.get('/:id/public', async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id, {
      attributes: ['id', 'title', 'description', 'questions', 'pages', 'endMessage', 'isBuiltIn', 'isActive'],
    });

    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isBuiltIn) {
      return res.status(400).json({ message: 'This survey is hosted externally' });
    }

    if (!survey.isActive) {
      return res.status(400).json({ message: 'This survey is no longer active' });
    }

    res.json({ survey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/surveys/:id/respond — submit response to a built-in survey (no auth)
router.post('/:id/respond', async (req, res) => {
  try {
    const { answers } = req.body;

    const survey = await Survey.findByPk(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (!survey.isBuiltIn || !survey.isActive) {
      return res.status(400).json({ message: 'Cannot submit response to this survey' });
    }

    await SurveyResponse.create({
      surveyId: survey.id,
      answers,
    });

    await survey.update({ responses: survey.responses + 1 });

    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/surveys/:id/responses — get responses for a built-in survey (owner only)
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const responses = await SurveyResponse.findAll({
      where: { surveyId: survey.id },
      order: [['createdAt', 'DESC']],
    });

    res.json({ responses, questions: survey.questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/surveys/:id/complete — mark survey as completed, award karma
router.post('/:id/complete', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const survey = await Survey.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner' }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!survey) {
      await t.rollback();
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.ownerId === req.user.id) {
      await t.rollback();
      return res.status(400).json({ message: 'You cannot complete your own survey' });
    }

    const alreadyCompleted = await SurveyCompletion.findOne({
      where: { userId: req.user.id, surveyId: survey.id },
      transaction: t,
    });

    if (alreadyCompleted) {
      await t.rollback();
      return res.status(400).json({ message: 'You have already completed this survey' });
    }

    // SurveySwap logic: karma reward = 1 per minute of survey duration
    const karmaReward = survey.duration;

    // Check if survey owner can afford this response (karma >= survey duration)
    if (survey.owner.karma < survey.duration) {
      await t.rollback();
      return res.status(400).json({ message: 'This survey is currently offline (owner has insufficient karma)' });
    }

    // Award karma to completer (1 karma per minute)
    await req.user.update({
      karma: req.user.karma + karmaReward,
      surveysCompleted: req.user.surveysCompleted + 1,
      totalKarmaEarned: req.user.totalKarmaEarned + karmaReward,
    }, { transaction: t });

    // Deduct karma from survey owner (cost = survey duration per response)
    const newOwnerKarma = Math.max(0, survey.owner.karma - survey.duration);
    await survey.owner.update({
      karma: newOwnerKarma,
    }, { transaction: t });

    // Update survey responses and record completion
    await survey.update({ responses: survey.responses + 1 }, { transaction: t });
    await SurveyCompletion.create({ userId: req.user.id, surveyId: survey.id }, { transaction: t });

    await t.commit();

    res.json({
      message: `Survey completed! You earned ${karmaReward} karma.`,
      karmaEarned: karmaReward,
      newKarma: req.user.karma,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/surveys/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await survey.destroy();
    res.json({ message: 'Survey deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/surveys/:id/toggle — toggle survey active status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const survey = await Survey.findByPk(req.params.id);
    if (!survey) {
      return res.status(404).json({ message: 'Survey not found' });
    }

    if (survey.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await survey.update({ isActive: !survey.isActive });
    res.json({ survey });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
