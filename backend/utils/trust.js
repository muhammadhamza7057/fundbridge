function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function calculateProfileCompleteness(user) {
  const checks = [
    user?.name,
    user?.email,
    user?.phone,
    user?.avatar,
    user?.role,
    user?.authProvider,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

function recalculateTrustFields(user) {
  const profileCompleteness = clamp(user?.profileCompleteness ?? calculateProfileCompleteness(user), 0, 100);
  const emailContribution = user?.emailVerified ? 15 : 0;
  const phoneContribution = user?.phoneVerified ? 10 : 0;
  const adminContribution = user?.adminApproved ? 5 : 0;
  const relationContribution = user?.adminRelationStatus === 'verified' ? 12 : user?.adminRelationStatus === 'rejected' ? 0 : 4;
  const activityContribution = Math.round(clamp(user?.activityScore, 0, 100) * 0.2);
  const reviewContribution = Math.round(clamp(user?.reviewScore, 0, 100) * 0.1);

  const trustScore = clamp(
    Math.round(profileCompleteness * 0.35 + emailContribution + phoneContribution + adminContribution + relationContribution + activityContribution + reviewContribution),
    0,
    100
  );

  return {
    profileCompleteness,
    trustScore,
    breakdown: {
      profile: Math.round(profileCompleteness * 0.35),
      emailVerified: emailContribution,
      phoneVerified: phoneContribution,
      adminApproved: adminContribution,
      relation: relationContribution,
      activity: activityContribution,
      reviews: reviewContribution,
    },
  };
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = {
  clamp,
  calculateProfileCompleteness,
  recalculateTrustFields,
  generateVerificationCode,
};
