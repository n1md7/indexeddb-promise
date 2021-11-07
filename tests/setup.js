const { JSDOM } = require('jsdom');
window = new JSDOM().window;
window.indexedDB = require('fake-indexeddb');
