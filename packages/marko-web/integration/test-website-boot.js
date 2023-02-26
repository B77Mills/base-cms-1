const { htmlEntities } = require('@parameter1/base-cms-html');
const { sleep: wait, cleanPath } = require('@parameter1/base-cms-utils');
const whilst = require('async/whilst');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const { log } = console;

const origin = process.env.MARKO_WEB_INTEGRATION_TEST_URL || 'http://localhost:80';

const fetchResponse = async ({
  path = '/',
  catchErrors = false,
  returnNullWhenNotOk = false,
} = {}) => {
  const url = `${cleanPath(origin)}/${cleanPath(path)}`;
  log(`fetching ${url}`);
  const opts = { method: 'get' };
  if (!catchErrors) return fetch(url, opts);
  try {
    const res = await fetch(url, opts);
    if (returnNullWhenNotOk && !res.ok) return null;
    return res;
  } catch (e) {
    return null;
  }
};

const checkReadiness = async ({
  path = '/_health',
  startAfter = 5000,
  checkInterval = 2000,
  unhealthyAfter = 5,
} = {}) => {
  log('checking readiness...');
  log(`initially waiting for ${startAfter}ms before checking...`);
  await wait(startAfter);

  let timesChecked = 0;
  let booted = false;
  await whilst(async () => !booted, async () => {
    timesChecked += 1;
    if (timesChecked > unhealthyAfter) {
      throw new Error('The readiness probe has reached its maximum check limit.');
    }
    log(`pinging health check, attempt number ${timesChecked}...`);
    const res = await fetchResponse({ path, catchErrors: true });
    // if response is null, a connection error occrred
    if (res == null || (res && !res.ok)) {
      if (res == null) log('did not receive a response - assuming not ready.');
      if (res && !res.ok) log(`received a non-ok response from health check - ${res.status} ${res.statusText}`);
      log(`waiting another ${checkInterval}ms before retrying.`);
      await wait(checkInterval);
      return;
    }
    booted = true;
  });
  log('container is ready.');
};

const testPage = async ({ path, retryAttempts = 3, allowNotFound = false } = {}) => {
  log(`testing page path ${path}`);

  let timesChecked = 0;
  let passed = false;
  let html;
  await whilst(async () => !passed, async () => {
    timesChecked += 1;
    if (timesChecked > retryAttempts) {
      throw new Error(`The test runner for page path ${path} has reached its maximum check limit.`);
    }
    const res = await fetchResponse({ path });
    if (!res.ok) {
      if (allowNotFound && res.status === 404) {
        log(`received a 404 not found from path ${path} but was set as allowed for this test. treating as passing.`);
        passed = true;
        return;
      }
      throw new Error(`Received a non-ok response from path page ${path}`, res.status, res.statusText);
    }
    html = await res.text();

    // first ensure the entire page rendered. if it didn't a fatal backened error occurred
    // that prevented rendering.
    const found = /.*<\/head>.*<\/body>.*<\/html>.*/is.test(html);
    if (!found) throw new Error(`The page at path ${path} did not completely render.`);

    // then check for in-body errors. this means an async internal block failed
    // but the page could fully render.
    const matches = [...html.matchAll(/data-marko-error="(.*?)"/g)];
    const errors = [];
    matches.forEach((values) => {
      const value = values[1];
      errors.push(htmlEntities.decode(value));
    });
    if (errors.length) {
      // if all the errors were timeout errors, let's try again.
      if (errors.every((msg) => msg === 'Timed out after 10000ms')) {
        log(`all errors for page path ${path} were timeout errors. retrying...`);
        return;
      }
      // otherwise error.
      log({ path, errors });
      throw new Error(`Encountered server-side Marko error(s) at page path ${path}`);
    }
    passed = true;
  });
  log(`page path ${path} passed tests.`);
  return html;
};

const run = async () => {
  await checkReadiness();

  // test homepage first, and get html.
  const html = await testPage({ path: '/' });

  const toTest = new Map([
    ['/search', { allowNotFound: true }],
  ]);

  const $ = cheerio.load(html);
  const $a = $('a[href^="/"]');

  $a.each(function getHref() {
    const href = $(this).attr('href');
    if (toTest.has(href) || href === '/') return;
    if (toTest.size === 10) return;
    toTest.set(href, { allowNotFound: true });
  });

  // now test all extracted pages.
  await Promise.all([...toTest].map(async ([path, opts]) => testPage({
    ...opts,
    path,
  })));
};

run().catch((e) => setImmediate(() => { throw e; }));
