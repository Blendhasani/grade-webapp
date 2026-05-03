/**
 * Matches static/index.html: inputs #studentId, #studentName, #subject, #grade and #message.
 * JSON field names follow the Haskell Generic Aeson instances in Types.hs.
 */
(function () {
  'use strict';

  function $(id) {
    return document.getElementById(id);
  }

  function setMessage(text) {
    var el = $('message');
    if (!el) return;
    el.textContent = text || '';
  }

  function triggerRefresh() {
    if (typeof window.__recordsRefresh === 'function') {
      window.__recordsRefresh();
    } else {
      try {
        window.dispatchEvent(new CustomEvent('records:refresh', { bubbles: true }));
      } catch (e) {}
    }
  }

  window.addRecord = function () {
    var sidEl = $('studentId');
    var nameEl = $('studentName');
    var subjEl = $('subject');
    var gradeEl = $('grade');
    if (!sidEl || !nameEl || !subjEl || !gradeEl) return;

    var studentId = parseInt(String(sidEl.value).trim(), 10);
    var studentName = String(nameEl.value || '').trim();
    var recordSubject = String(subjEl.value || '').trim();
    var recordGrade = parseFloat(String(gradeEl.value).trim());

    if (!studentId || studentId <= 0) {
      setMessage('Student ID must be a positive number.');
      return;
    }
    if (!studentName) {
      setMessage('Student name is required.');
      return;
    }
    if (recordGrade !== recordGrade || recordGrade < 0 || recordGrade > 100) {
      setMessage('Grade must be between 0 and 100.');
      return;
    }

    var body = {
      recordStudent: { studentId: studentId, studentName: studentName },
      recordSubject: recordSubject,
      recordGrade: recordGrade,
    };

    fetch('/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'same-origin',
    })
      .then(function (res) {
        var ct = res.headers.get('Content-Type') || '';
        var parse =
          ct.indexOf('application/json') !== -1 ? res.json() : res.text();
        return parse.then(function (data) {
          if (!res.ok) {
            var msg =
              typeof data === 'object' &&
              data &&
              typeof data.error === 'string'
                ? data.error
                : typeof data === 'string' && data
                  ? data
                  : res.statusText || 'Request failed';
            throw new Error(msg);
          }
          return data;
        });
      })
      .then(function () {
        setMessage('Record added.');
        sidEl.value = '';
        nameEl.value = '';
        gradeEl.value = '';
        triggerRefresh();
      })
      .catch(function (err) {
        setMessage(err.message || 'Something went wrong.');
      });
  };
})();
