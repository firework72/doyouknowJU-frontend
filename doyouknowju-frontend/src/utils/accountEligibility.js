export const WRITE_RESTRICTION_DAYS = 7;

const SIGNUP_DATE_KEYS = [
  'signupDate',
  'joinedAt',
  'joinDate',
  'createDate',
  'createdAt',
  'regDate',
  'registerDate',
  'enrollDate',
  'memberCreatedAt',
];

const parseDateValue = (value) => {
  if (!value) return null;

  if (Array.isArray(value)) {
    const date = new Date(
      value[0],
      (value[1] || 1) - 1,
      value[2] || 1,
      value[3] || 0,
      value[4] || 0,
      value[5] || 0
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getSignupDate = (user) => {
  if (!user || typeof user !== 'object') return null;

  for (const key of SIGNUP_DATE_KEYS) {
    const parsed = parseDateValue(user[key]);
    if (parsed) return parsed;
  }

  return null;
};

export const canWriteAfterSignupDays = (user, minDays = WRITE_RESTRICTION_DAYS) => {
  if (!user) return false;

  const signupDate = getSignupDate(user);
  if (!signupDate) return true;

  const now = Date.now();
  const diffMs = now - signupDate.getTime();
  const requiredMs = minDays * 24 * 60 * 60 * 1000;
  return diffMs >= requiredMs;
};

export const getWriteRestrictionMessage = (minDays = WRITE_RESTRICTION_DAYS) =>
  `가입 후 ${minDays}일이 지나야 작성할 수 있습니다.`;

