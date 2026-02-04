import axios from 'axios';

export const REPORT_TYPES = Object.freeze({
  BOARD: 'BOARD',
  REPLY: 'REPLY',
  CHAT: 'CHAT',
});

export const insertReport = async ({ reportType, contentId, reporterId, targetId, reportReason }) => {
  const { data } = await axios.post('/dykj/api/report/insert', {
    reportType,
    contentId,
    reporterId,
    targetId,
    reportReason,
  });
  return data;
};

