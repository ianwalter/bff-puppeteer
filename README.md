# @ianwalter/bff-puppeteer
> A [bff][bffUrl] plugin to enable [Puppeteer][pptrUrl]-based testing

[![npm page][npmImage]][npmUrl]
[![CI][ciImage]][ciUrl]

## Installation

```console
yarn add @ianwalter/bff-puppeteer --dev
```

# Usage

Add `bff-puppeteer` as a `bff` plugin in `package.json`:

```json
"bff": {
  "plugins": [
    "@ianwalter/bff-puppeteer"
  ]
}
```

Create a test like `example.pptr.js` and import the test function from 
`@ianwalter/bff-puppeteer`:

```js
import { test } from '@ianwalter/bff-puppeteer'

test('something', t => {
  t.exepct(window).toBeDefined()
})
```

## Related

* [`@ianwalter/bff`][bffUrl] - Your friendly test runner/framework
* [`@ianwalter/bff-webdriver`][bffWebdriverUrl] - A bff plugin to enable
  WebDriver-based testing
* [`@ianwalter/puppeteer`][iwpupUrl] - A GitHub Action / Docker image for
  Puppeteer, the Headless Chrome Node API

## License

Hippocratic License - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://ianwalter.dev)

[bffUrl]: https://github.com/ianwalter/bff
[pptrUrl]: https://pptr.dev
[npmImage]: https://img.shields.io/npm/v/@ianwalter/bff-puppeteer.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/bff-puppeteer
[ciImage]: https://github.com/ianwalter/bff-puppeteer/workflows/CI/badge.svg
[ciUrl]: https://github.com/ianwalter/bff-puppeteer/actions
[bffWebdriverUrl]: https://github.com/ianwalter/bff-webdriver
[iwpupUrl]: https://github.com/ianwalter/puppeteer
[licenseUrl]: https://github.com/ianwalter/bff-puppeteer/blob/master/LICENSE
