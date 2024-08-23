/**
 *
 * @param {number} seconds
 * @returns readable time string formatted '1h 10m 30s'
 */
export function formatSecondsToHumanString(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  let formattedTime = '';

  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes}m `;
  }
  if (remainingSeconds > 0 || formattedTime === '') {
    formattedTime += `${remainingSeconds}s`;
  }

  return formattedTime.trim();
}

export function asyncTimeout(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
