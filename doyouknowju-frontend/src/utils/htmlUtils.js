const handleSharedReplacements = (html) => {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<li>/gi, '\n- ')
        .replace(/<\/li>/gi, '');
};

export const stripHtml = (html) => {
    let text = handleSharedReplacements(html);

    // 나머지 모든 태그 제거
    text = text.replace(/<[^>]*>/g, '');

    // HTML 엔티티 변환
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

export const stripHtmlKeepImages = (html) => {
    if (!html) return '';

    // 블록 요소들을 줄바꿈으로 변환 (HTML 렌더링을 위해 태그 유지)
    let processed = html
        .replace(/<br\s*\/?>/gi, '<br/>\n')
        .replace(/<\/p>/gi, '</p>\n')
        .replace(/<\/div>/gi, '</div>\n')
        .replace(/<li>/gi, '\n- ')
        .replace(/<\/li>/gi, '');

    // <img> 태그와 줄바꿈 태그를 제외한 나머지 모든 태그 제거
    processed = processed.replace(/<(?!img\s|\/img>|br\s*\/?>)[^>]+>/gi, '');

    return processed.trim();
};