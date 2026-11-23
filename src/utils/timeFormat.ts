/**
 * Format total reading duration from firstOpenedAt to finishedAt.
 * - If >= 24 hours: display in days (e.g., "3 ngày").
 * - If < 24 hours: display in hours (e.g., "5 giờ" or "Dưới 1 giờ"), no minutes/seconds.
 */
export function formatReadingDuration(
  firstOpenedAt: number | null,
  finishedAt: number | null
): string {
  if (!firstOpenedAt || !finishedAt) return '1 giờ';
  const diffMs = Math.max(0, finishedAt - firstOpenedAt);
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours >= 24) {
    const days = Math.max(1, Math.round(diffHours / 24));
    return `${days} ngày`;
  }

  const hours = Math.floor(diffHours);
  if (hours < 1) {
    return 'Dưới 1 giờ';
  }
  return `${hours} giờ`;
}

/**
 * Format relative elapsed time since last read ("kể từ bao lâu").
 */
export function formatTimeSinceLastRead(
  lastReadAt: number | null,
  now: number = Date.now()
): string {
  if (!lastReadAt) return 'Chưa đọc';
  const diffMs = Math.max(0, now - lastReadAt);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 2) return 'Vừa xong';
  if (diffHours < 1) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 30) return `${diffDays} ngày trước`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(diffDays / 365);
  return `${years} năm trước`;
}

export function formatShortDate(timestamp: number | null): string {
  if (!timestamp) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(timestamp));
}
