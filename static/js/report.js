(function () {
  'use strict';

  var CONFIG = {
    apiReport: '/api/report',
    statsRootId: 'report-stats',
    errorBannerId: 'report-error',
    listenRecordsRefresh: true,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function formatFixed(n, decimals) {
    if (n == null || typeof n !== 'number' || !isFinite(n)) return '—';
    return n.toFixed(decimals);
  }

  function formatInt(n) {
    if (n == null || typeof n !== 'number' || !isFinite(n)) return '—';
    return String(Math.round(n));
  }

  function formatPercent(n, decimals) {
    if (n == null || typeof n !== 'number' || !isFinite(n)) return '—';
    return n.toFixed(decimals) + '%';
  }

  function showBanner(message) {
    var el = $(CONFIG.errorBannerId);
    if (!el) return;
    el.textContent = message || '';
    el.hidden = !message;
    el.setAttribute('role', message ? 'alert' : 'presentation');
  }

  function fetchJson(url) {
    return fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    }).then(function (res) {
      var ct = res.headers.get('Content-Type') || '';
      var parse =
        ct.indexOf('application/json') !== -1 ? res.json() : res.text();
      return parse.then(function (body) {
        if (!res.ok) {
          var msg =
            typeof body === 'object' &&
            body &&
            typeof body.error === 'string'
              ? body.error
              : typeof body === 'string' && body
                ? body
                : res.statusText || 'Request failed';
          throw new Error(msg);
        }
        return body;
      });
    });
  }

  function normalizeReport(raw) {
    return {
      average:
        raw.reportAverage != null
          ? raw.reportAverage
          : raw.average != null
            ? raw.average
            : null,
      highest:
        raw.reportHighest != null ? raw.reportHighest : raw.highest,
      lowest:
        raw.reportLowest != null ? raw.reportLowest : raw.lowest,
      passRate:
        raw.reportPassRate != null ? raw.reportPassRate : raw.passRate,
      passingCount:
        raw.reportPassingCount != null
          ? raw.reportPassingCount
          : raw.passingCount,
      failingCount:
        raw.reportFailingCount != null
          ? raw.reportFailingCount
          : raw.failingCount,
    };
  }

  function renderStats(report) {
    var root = $(CONFIG.statsRootId);
    if (!root) return;

    var r = normalizeReport(report || {});
    root.innerHTML =
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Class average</div>' +
      '<div class="report-stat-value">' +
      esc(formatFixed(r.average, 2)) +
      '</div></div>' +
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Highest grade</div>' +
      '<div class="report-stat-value">' +
      esc(formatFixed(r.highest, 2)) +
      '</div></div>' +
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Lowest grade</div>' +
      '<div class="report-stat-value">' +
      esc(formatFixed(r.lowest, 2)) +
      '</div></div>' +
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Pass rate</div>' +
      '<div class="report-stat-value">' +
      esc(formatPercent(r.passRate, 1)) +
      '</div></div>' +
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Passing</div>' +
      '<div class="report-stat-value">' +
      esc(formatInt(r.passingCount)) +
      '</div></div>' +
      '<div class="report-stat-card">' +
      '<div class="report-stat-label">Failing</div>' +
      '<div class="report-stat-value">' +
      esc(formatInt(r.failingCount)) +
      '</div></div>';
  }

  function loadReportStats() {
    showBanner('');
    return fetchJson(CONFIG.apiReport)
      .then(function (rep) {
        renderStats(rep);
      })
      .catch(function (err) {
        showBanner(err.message || 'Class report could not be loaded.');
        renderStats({});
      });
  }

  function bindRefreshHook() {
    if (!CONFIG.listenRecordsRefresh) return;

    function schedule() {
      loadReportStats();
    }

    if (typeof window.__recordsRefresh === 'function') {
      var prev = window.__recordsRefresh;
      window.__recordsRefresh = function () {
        try {
          prev();
        } finally {
          schedule();
        }
      };
    } else {
      window.__recordsRefresh = schedule;
    }

    window.addEventListener('records:refresh', schedule);
  }

  function init() {
    bindRefreshHook();
    loadReportStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
