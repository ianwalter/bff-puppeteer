import { test } from '@ianwalter/bff-puppeteer'

test('deep equal failure', ({ expect }) => {
  expect({ name: 'Joe' }).toBe({ name: 'Joe' })
})

test('property of undefined', ({ expect }) => {
  expect(window.thing.that.does.not.exist).tobeDefined()
})
