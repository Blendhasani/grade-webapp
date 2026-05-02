(function () {
    'use strict';
  
    var CONFIG = {
      apiReport: '/api/report',
      apiCategories: '/api/categories',
      statsRootId: 'report-stats',
      categoriesRootId: 'report-categories',
      categoriesTbodyId: 'report-categories-tbody',
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
  
    function categoryStudent(row) {
      return row.student != null ? row.student : row.studentName || '—';
    }
  
    function categorySubject(row) {
      return row.subject != null ? row.subject : '—';
    }
  
    function categoryGrade(row) {
      var g = row.grade;
      if (g == null || typeof g !== 'number' || !isFinite(g)) return '—';
      return formatFixed(g, 2);
    }
  
    function categoryLabel(row) {
      return row.category != null ? row.category : '—';
    }
  
    function renderCategories(rows) {
      var tbody = $(CONFIG.categoriesTbodyId);
      var wrap = $(CONFIG.categoriesRootId);
      if (!tbody) return;
  
      tbody.innerHTML = '';
      var list = Array.isArray(rows) ? rows : [];
  
      if (wrap) {
        wrap.classList.toggle('report-categories--empty', list.length === 0);
      }
  
      list.forEach(function (row) {
        var tr = document.createElement('tr');
        tr.innerHTML =
          '<td>' +
          esc(categoryStudent(row)) +
          '</td><td>' +
          esc(categorySubject(row)) +
          '</td><td>' +
          esc(categoryGrade(row)) +
          '</td><td>' +
          esc(categoryLabel(row)) +
          '</td>';
        tbody.appendChild(tr);
      });
    }
  
    function renderEmptyCategoriesMessage() {
      var tbody = $(CONFIG.categoriesTbodyId);
      var wrap = $(CONFIG.categoriesRootId);
      if (!tbody) return;
      tbody.innerHTML = '';
      if (wrap) wrap.classList.add('report-categories--empty');
      var tr = document.createElement('tr');
      tr.className = 'report-categories-empty-row';
      var td = document.createElement('td');
      td.colSpan = 4;
      td.className = 'report-categories-empty-cell';
      td.textContent = 'No grade rows yet.';
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
  
    function loadDashboard() {
      showBanner('');
  
      Promise.all([
        fetchJson(CONFIG.apiReport).catch(function (err) {
          return { __error: err.message || 'Report unavailable', __partial: 'report' };
        }),
        fetchJson(CONFIG.apiCategories).catch(function (err) {
          return { __error: err.message || 'Categories unavailable', __partial: 'categories' };
        }),
      ])
        .then(function (pair) {
          var rep = pair[0];
          var cats = pair[1];
  
          var messages = [];
          if (rep && rep.__error) messages.push('Stats: ' + rep.__error);
          if (cats && cats.__error) messages.push('Categories: ' + cats.__error);
  
          if (rep && rep.__error) {
            renderStats({});
          } else {
            renderStats(rep);
          }
  
          if (cats && cats.__error) {
            renderCategories([]);
            renderEmptyCategoriesMessage();
          } else if (Array.isArray(cats) && cats.length === 0) {
            renderCategories([]);
            renderEmptyCategoriesMessage();
          } else {
            renderCategories(cats);
          }
  
          if (messages.length) showBanner(messages.join(' · '));
        })
        .catch(function () {
          showBanner('Dashboard could not be loaded.');
          renderStats({});
          renderCategories([]);
          renderEmptyCategoriesMessage();
        });
    }
  
    function bindRefreshHook() {
      if (!CONFIG.listenRecordsRefresh) return;
  
      function schedule() {
        loadDashboard();
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
      loadDashboard();
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();