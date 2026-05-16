const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const User = require('../models/User');

function buildPublicUploadUrl(req, filename) {
  if (!filename) return '';
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

exports.createStartup = async (req, res) => {
  try {
    const { name, industry, fundingNeeded, description } = req.body;
    const stage = req.body.stage || 'Seed';
    const parsedFundingNeeded = Number(fundingNeeded);

    if (!name || !industry || fundingNeeded === undefined || fundingNeeded === null || fundingNeeded === '' || !description) {
      return res.status(400).json({ message: 'All startup fields are required' });
    }

    if (Number.isNaN(parsedFundingNeeded)) {
      return res.status(400).json({ message: 'Funding needed must be a valid number' });
    }

    if (!['founder', 'startup_rep'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only founders or startup representatives can create startup profiles' });
    }

    const pitchDeck = req.file ? buildPublicUploadUrl(req, req.file.filename) : (req.body.pitchDeck || '');

    const startup = await Startup.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          userId: req.user._id,
          name,
          industry,
          stage,
          fundingNeeded: parsedFundingNeeded,
          description,
          pitchDeck,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    await User.findByIdAndUpdate(req.user._id, { role: req.user.role, authProvider: req.user.authProvider });

    return res.status(200).json({
      message: 'Startup profile saved successfully',
      startup,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save startup profile', error: error.message });
  }
};

exports.createInvestor = async (req, res) => {
  try {
    const { budgetMin, budgetMax, industries, riskLevel } = req.body;
    const parsedBudgetMin = Number(budgetMin);
    const parsedBudgetMax = Number(budgetMax);

    if (budgetMin === undefined || budgetMin === null || budgetMin === '' || budgetMax === undefined || budgetMax === null || budgetMax === '' || !riskLevel) {
      return res.status(400).json({ message: 'Budget range and risk level are required' });
    }

    if (Number.isNaN(parsedBudgetMin) || Number.isNaN(parsedBudgetMax)) {
      return res.status(400).json({ message: 'Budget values must be valid numbers' });
    }

    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can create investor profiles' });
    }

    const parsedIndustries = Array.isArray(industries)
      ? industries
      : String(industries || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const investor = await Investor.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          userId: req.user._id,
          investmentRange: { min: parsedBudgetMin, max: parsedBudgetMax },
          industries: parsedIndustries,
          riskLevel,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      message: 'Investor profile saved successfully',
      investor,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save investor profile', error: error.message });
  }
};
