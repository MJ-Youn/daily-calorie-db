/**
 * 날짜 및 시간 포맷팅을 위한 유틸리티 함수 모음입니다.
 * 시스템 타임존을 기반으로 시간을 변환하여 글로벌 지원을 제공합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-29
 */

/**
 * 주어진 날짜 문자열을 시스템 타임존 기준의 시간 문자열로 변환합니다.
 * 입력값이 UTC라고 가정하고 처리합니다.
 *
 * @param dateString UTC 날짜 문자열 (예: "2026-01-29T04:11:00")
 * @returns 포맷팅된 시간 문자열 (예: "13:11")
 */
export function formatTime(dateString: string): string {
    if (!dateString) return '';
    // 입력된 문자열을 UTC로 처리하기 위해 'Z'가 없으면 추가
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    
    return new Date(utcDateString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

/**
 * 주어진 날짜 문자열을 시스템 타임존 기준의 날짜 문자열로 변환합니다.
 *
 * @param dateString 날짜 문자열
 * @param options Intl.DateTimeFormatOptions (선택 사항)
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateString) return '';
    // 날짜의 경우 시간대 변환이 필요할 수도 있고 아닐 수도 있지만, 
    // 일관성을 위해 Date 객체 생성 규칙은 동일하게 가져갑니다.
    // 단, 날짜만 있는 경우("YYYY-MM-DD")에는 그대로 파싱하도록 합니다.
    const isTimeIncluded = dateString.includes('T') || dateString.includes(':');
    const targetDateString = isTimeIncluded && !dateString.endsWith('Z') ? dateString + 'Z' : dateString;

    return new Date(targetDateString).toLocaleDateString(undefined, options);
}
