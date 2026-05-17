const Deal = require('../models/Deal');

const ALLOWED_STAGES = ['Interested', 'Pitch Shared', 'Negotiation', 'Funded'];

exports.createDeal = async (req, res) => {
  try {
    const { startupId, investorId, amount, stage, title, description, documents } = req.body;
    const createdBy = req.user?._id;

    if (!startupId || !investorId || typeof amount === 'undefined') {
      return res.status(400).json({ message: 'startupId, investorId and amount are required' });
    }

    if (amount < 0) return res.status(400).json({ message: 'amount must be >= 0' });

    const stageToSet = stage && ALLOWED_STAGES.includes(stage) ? stage : 'Interested';

    const deal = new Deal({ startupId, investorId, amount, stage: stageToSet, title: title || '', description: description || '', documents: Array.isArray(documents) ? documents : [], createdBy });
    await deal.save();

    res.status(201).json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    if (updates.stage && !ALLOWED_STAGES.includes(updates.stage)) {
      return res.status(400).json({ message: `Invalid stage. Allowed: ${ALLOWED_STAGES.join(', ')}` });
    }

    if (typeof updates.amount !== 'undefined' && updates.amount < 0) {
      return res.status(400).json({ message: 'amount must be >= 0' });
    }

    const deal = await Deal.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    // apply allowed updates
    if (typeof updates.amount !== 'undefined') deal.amount = updates.amount;
    if (typeof updates.stage !== 'undefined') deal.stage = updates.stage;
    if (typeof updates.startupId !== 'undefined') deal.startupId = updates.startupId;
    if (typeof updates.investorId !== 'undefined') deal.investorId = updates.investorId;
    if (typeof updates.title !== 'undefined') deal.title = updates.title;
    if (typeof updates.description !== 'undefined') deal.description = updates.description;
    if (typeof updates.documents !== 'undefined' && Array.isArray(updates.documents)) deal.documents = updates.documents;

    await deal.save();
    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findById(id)
      .populate('startupId', 'name description')
      .populate('investorId', 'name company');

    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    res.json(deal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// List deals for the authenticated user (participant or creator)
exports.listDealsForUser = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    // find deals where user is startup, investor or creator
    const deals = await Deal.find({ $or: [{ startupId: userId }, { investorId: userId }, { createdBy: userId }] })
      .sort({ updatedAt: -1 });

    res.json(deals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
