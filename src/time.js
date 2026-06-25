function beijingISO() {
  const d = new Date();
  const bj = new Date(d.getTime() + 8 * 3600000);
  return bj.toISOString().replace('T', ' ').replace('Z', '');
}

function beijingISOShort() {
  return beijingISO().slice(0, 19);
}

module.exports = { beijingISO, beijingISOShort };
