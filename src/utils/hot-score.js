/**
 * 根据 Reddit 的热门算法计算帖子的分数
 * @param {number} comment_count - 帖子的评论数（作为基础分数）
 * @param {string} timestamp - 帖子的创建时间 (e.g., "2023-10-27 10:00:00")
 * @returns {number} - 计算出的热门分数
 */
function calculateHotScore(comment_count, timestamp) {
  // Reddit 算法: log10(z) + (y * t) / 45000
  // z = max(1, |score|)
  // y = sign(score)
  // t = seconds since Unix epoch

  const score = comment_count; // 在我们的例子中，基础分数是评论数
  const order = Math.log10(Math.max(1, score));
  
  // y (sign) in our case is always 1 since comment_count is non-negative
  const sign = 1;

  // t is the number of seconds since the Unix epoch.
  // The timestamp from SQLite is a string, so we convert it to a Date object,
  // then get the time in milliseconds and convert to seconds.
  const seconds = new Date(timestamp).getTime() / 1000;

  // Reddit's epoch is 2005-12-08 07:46:43, but using the standard Unix epoch is fine
  // as the time difference is what matters.
  // The 45000 is a magic number that determines how quickly scores decay.
  // It's approximately 12.5 hours in seconds.
  const hotScore = order + (sign * seconds) / 45000;
  
  return hotScore;
}

module.exports = { calculateHotScore };
