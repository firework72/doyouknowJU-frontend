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

// 신고 조회
export const getReportById = async(reportId) =>{
  try{
    const { data } = await axios.get(`/dykj/api/report/${reportId}`);
    return data;
  } catch(error) {
    console.error('신고 조회 실패: ', error);
    throw error;
  }
};

//신고 상태 변경
export const updateReportStatus = async (reportId, status) =>{
  try{
    const{ data } = await axios.put(`/dykj/api/report/${reportId}/status`, { status });
    return data;
  } catch(error) {
    console.error('신고 상태 변경 실패: ', error);
    throw error;
  }
};