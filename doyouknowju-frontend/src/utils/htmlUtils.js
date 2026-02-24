export const stripHtml = (html) => {
    if (!html) return '';

    // 1. 브라우저 환경인 경우 DOMParser 또는 임시 div 사용 가능
    // 2. 간단한 정규식 처리 (서버 사이드 렌더링 고려 또는 가벼운 처리)

    // 블록 요소들이 붙어버리는 것을 방지하기 위해 <br>, <p>, <div> 등을 공백/줄바꿈으로 변환
    let text = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<li>/gi, '\n- ')
        .replace(/<\/li>/gi, '');

    // 나머지 모든 태그 제거
    text = text.replace(/<[^>]*>/g, '');

    // HTML 엔티티 변환 (최소한의 변환)
    const entities = {
        '&nbsp;': ' ',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&quot;': '"',
        '&#39;': "'",
    };

    Object.keys(entities).forEach(entity => {
        text = text.replace(new RegExp(entity, 'g'), entities[entity]);
    });

    // 연속된 공백 및 줄바꿈 정리
    return text.trim();
};