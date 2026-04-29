/**
 * Records UI — add-record form (submit, validation, messages, refresh hook).
 * Adjust selectors (#ids), field names, and API_URL to match your HTML/backend.
 */
(function () {
    'use strict';
  
    // --- Config: tune to your templates ---
    var FORM_ID = 'add-record-form';
    var MESSAGE_ID = 'add-record-message';
    /** POST endpoint that accepts JSON body for a new record */
    var API_URL = '/api/records'; // or '/records' etc.
  
    /** Fields sent as JSON keys — names must match backend */
    var FIELD_NAMES = ['title', 'notes']; // example; add/remove as needed
  
    function $(id) {
      return document.getElementById(id);
    }
  
    function getMessageEl() {
      return $(MESSAGE_ID);
    }
  
    function showMessage(text, kind) {
      var el = getMessageEl();
      if (!el) return;
      el.textContent = text || '';
      el.hidden = !text;
      el.classList.remove('message--success', 'message--error', 'message--info');
      if (kind) el.classList.add('message--' + kind);
      el.setAttribute('role', 'alert');
    }
  
    function clearMessage() {
      showMessage('', null);
    }
  
    function validate(form) {
      var errors = [];
  
      FIELD_NAMES.forEach(function (name) {
        var input = form.elements[name];
        if (!input) return;
        var v = (input.value || '').trim();
        if (input.required && v === '') {
          errors.push((input.labels && input.labels[0] && input.labels[0].textContent)
            ? input.labels[0].textContent.replace(/\s*\*$/, '').trim() + ' is required.'
            : name + ' is required.');
        }
      });
  
      // Example: optional max length
      var title = form.elements.title;
      if (title && title.value && title.value.length > 200) {
        errors.push('Title must be at most 200 characters.');
      }
  
      return errors;
    }
  
    function collectPayload(form) {
      var body = {};
      FIELD_NAMES.forEach(function (name) {
        var input = form.elements[name];
        if (!input) return;
        var val = (input.value || '').trim();
        body[name] = val;
      });
      return body;
    }
  
    function triggerRefreshHook() {
      if (typeof window.__recordsRefresh === 'function') {
        window.__recordsRefresh();
        return;
      }
      try {
        window.dispatchEvent(new CustomEvent('records:refresh', { bubbles: true }));
      } catch (e) {
        /* IE11: omit or polyfill CustomEvent */
      }
    }
  
    function submitRecord(form) {
      clearMessage();
  
      var errs = validate(form);
      if (errs.length) {
        showMessage(errs[0], 'error');
        var firstInvalid = form.querySelector(':invalid, [aria-invalid="true"]');
        if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
        return;
      }
  
      var payload = collectPayload(form);
      var btn = form.querySelector('[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.setAttribute('aria-busy', 'true');
      }
  
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'same-origin',
      })
        .then(function (res) {
          var ct = res.headers.get('Content-Type') || '';
          var parse =
            ct.indexOf('application/json') !== -1 ? res.json() : res.text();
  
          return parse.then(function (data) {
            if (!res.ok) {
              var msg =
                typeof data === 'object' && data && data.error
                  ? data.error
                  : typeof data === 'object' && data && data.message
                    ? data.message
                    : res.statusText || 'Request failed';
              throw new Error(msg);
            }
            return data;
          });
        })
        .then(function () {
          showMessage('Record added successfully.', 'success');
          form.reset();
          triggerRefreshHook();
        })
        .catch(function (err) {
          showMessage(err.message || 'Something went wrong.', 'error');
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.removeAttribute('aria-busy');
          }
        });
    }
  
    function onSubmit(ev) {
      ev.preventDefault();
      submitRecord(ev.target);
    }
  
    function init() {
      var form = $(FORM_ID);
      if (!form) return;
      form.addEventListener('submit', onSubmit);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();