const ui = {
  alertsLastIdx: 1,
  alerts: [],
}

const removeAlert = function(idx) {
  ui.alerts.filter((alert) => alert.idx == idx)[0].show = 0;
}

const pushAlert = function(content = "🐵", type = "info", duration = 2000) {
  console.log(["pushAlert", content, type, duration]);
  const idx = ui.alertsLastIdx + 1;
  ui.alerts.push({
    idx: idx,
    type: type,
    content: content,
    show: 1,
  });
  ui.alertsLastIdx += 1;
  setTimeout(() => {
    removeAlert(idx);
  }, duration);
}

export default pushAlert;