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

export const getReportList = async() =>{
  try{
    const { data } = await axios.get('/dykj/api/report/list');
    return data;
  }catch(error){
    console.error('신고 목록 조회 실패: ', error);
    throw error;
  }
};
