/**
 * Filters UI — passing / failing / subject / all, table re-render, empty & error states.
 * Requires a script-loaded page with the markup IDs below (or change CONFIG).
 */
(function () {
  'use strict';

  var CONFIG = {
    tbodyId: 'grades-tbody',
    tableWrapId: 'grades-table-wrap',
    emptyId: 'grades-empty',
    errorId: 'grades-error',
    /** Buttons: data-filter="all" | "passing" | "failing" | "subject" */
    filterButtonSelector: '[data-filter]',
    subjectInputId: 'filter-subject-input',
    subjectApplyId: 'filter-subject-apply',
    apiRecords: '/api/records',
    apiPassing: '/api/passing',
    apiFailing: '/api/failing',
    apiSubjectPrefix: '/api/subject/',
  };

  function $(id) {
    return document.getElementById(id);
  }

  var state = {
    mode: 'all',
    subjectName: '',
    loading: false,
    lastError: null,
    rows: [],
  };

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s == null ? '' : String(s);
    return d.innerHTML;
  }

  function studentName(row) {
    var st = row.recordStudent || row.student || {};
    return st.studentName != null ? st.studentName : st.name != null ? st.name : '—';
  }

  function subjectCell(row) {
    var subj = row.recordSubject != null ? row.recordSubject : row.subject;
    return typeof subj === 'string' ? subj : subj != null ? String(subj) : '—';
  }

  function gradeCell(row) {
    var g = row.recordGrade != null ? row.recordGrade : row.grade;
    return g != null ? String(g) : '—';
  }

  function setVisible(el, on) {
    if (!el) return;
    el.hidden = !on;
    el.setAttribute('aria-hidden', on ? 'false' : 'true');
  }

  function showError(message) {
    var errEl = $(CONFIG.errorId);
    var emptyEl = $(CONFIG.emptyId);
    var wrap = $(CONFIG.tableWrapId);
    if (errEl) {
      errEl.textContent = message || '';
      setVisible(errEl, !!message);
    }
    if (emptyEl) setVisible(emptyEl, false);
    if (wrap) wrap.classList.toggle('is-hidden', !!message);
  }

  function clearError() {
    showError('');
  }

  function showEmpty(show) {
    var emptyEl = $(CONFIG.emptyId);
    var wrap = $(CONFIG.tableWrapId);
    if (emptyEl) setVisible(emptyEl, show);
    if (wrap) wrap.classList.toggle('is-hidden', show);
    showError('');
  }

  function setLoading(isLoading) {
    state.loading = isLoading;
    document.body.classList.toggle('filters-loading', isLoading);
    var tbody = $(CONFIG.tbodyId);
    if (tbody) tbody.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  }

  function apiUrl() {
    switch (state.mode) {
      case 'passing':
        return CONFIG.apiPassing;
      case 'failing':
        return CONFIG.apiFailing;
      case 'subject': {
        var name = (state.subjectName || '').trim();
        return CONFIG.apiSubjectPrefix + encodeURIComponent(name);
      }
      default:
        return CONFIG.apiRecords;
    }
  }

  function fetchDataset() {
    clearError();
    if (state.mode === 'subject' && !(state.subjectName || '').trim()) {
      state.lastError = 'Enter a subject name.';
      state.rows = [];
      render();
      showError(state.lastError);
      return;
    }

    setLoading(true);
    state.lastError = null;

    fetch(apiUrl(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
      .then(function (res) {
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
                : res.status === 400
                  ? 'Invalid subject'
                  : res.statusText || 'Request failed';
            throw new Error(msg);
          }
          return body;
        });
      })
      .then(function (data) {
        state.rows = Array.isArray(data) ? data : [];
        render();
      })
      .catch(function (err) {
        state.rows = [];
        state.lastError = err.message || 'Something went wrong.';
        render();
        showError(state.lastError);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  function renderTableRows() {
    var tbody = $(CONFIG.tbodyId);
    if (!tbody) return;

    tbody.innerHTML = '';
    state.rows.forEach(function (row) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' +
        esc(studentName(row)) +
        '</td><td>' +
        esc(subjectCell(row)) +
        '</td><td>' +
        esc(gradeCell(row)) +
        '</td>';
      tbody.appendChild(tr);
    });
  }

  function render() {
    renderTableRows();

    var hasRows = state.rows.length > 0;
    var showEmptyState = !state.lastError && !hasRows && !state.loading;

    showEmpty(showEmptyState);
    if (!state.lastError) {
      showError('');
      var wrap = $(CONFIG.tableWrapId);
      if (wrap) wrap.classList.toggle('is-hidden', showEmptyState);
    }
  }

  function setActiveFilterButtons() {
    document.querySelectorAll(CONFIG.filterButtonSelector).forEach(function (btn) {
      var m = btn.getAttribute('data-filter');
      var active =
        m === state.mode ||
        (m === 'subject' && state.mode === 'subject');
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function applyMode(mode) {
    state.mode = mode;
    setActiveFilterButtons();
    if (mode !== 'subject') fetchDataset();
  }

  function applySubjectFromInput() {
    var input = $(CONFIG.subjectInputId);
    state.subjectName = input ? input.value : '';
    state.mode = 'subject';
    setActiveFilterButtons();
    fetchDataset();
  }

  function init() {
    document.querySelectorAll(CONFIG.filterButtonSelector).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-filter');
        if (!mode) return;
        if (mode === 'subject') {
          applySubjectFromInput();
          return;
        }
        applyMode(mode);
        fetchDataset();
      });
    });

    var applyBtn = $(CONFIG.subjectApplyId);
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        applySubjectFromInput();
      });
    }

    var subjectInput = $(CONFIG.subjectInputId);
    if (subjectInput) {
      subjectInput.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          applySubjectFromInput();
        }
      });
    }

    state.mode = 'all';
    setActiveFilterButtons();
    fetchDataset();

    if (typeof window.__recordsRefresh === 'function') {
      var prev = window.__recordsRefresh;
      window.__recordsRefresh = function () {
        prev();
        fetchDataset();
      };
    } else {
      window.__recordsRefresh = fetchDataset;
    }

    window.addEventListener('records:refresh', fetchDataset);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
