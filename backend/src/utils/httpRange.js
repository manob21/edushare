function parseRangeHeader(range, size) {
  if (!range) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!m) return null;
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? parseInt(m[2], 10) : size - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= size) return { invalid: true, size };
  return { start, end, chunk: end - start + 1 };
}
module.exports = { parseRangeHeader };