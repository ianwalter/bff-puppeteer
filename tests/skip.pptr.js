import { test } from '@ianwalter/bff-puppeteer'

test.skip('skip no assertions', () => true)

test.skip('skip with test specified after name')(({ fail }) => fail())

test.skip('skip with no test function')
