const { test, run } = require('@ianwalter/bff')

const toName = ({ name, err }) => name + (err ? `: ${err}` : '')

test('bff-webdriver', async ({ expect }) => {
  const result = await run({ plugins: ['.'] })
  expect(result.filesRegistered).toBe(3)
  expect(result.testsRegistered).toBe(6)
  expect(result.testsRun).toBe(7)
  expect(result.passed.length).toBe(3)
  expect(result.passed.map(toName).sort()).toMatchSnapshot()
  expect(result.failed.length).toBe(2)
  expect(result.failed.map(toName).sort()).toMatchSnapshot()
  expect(result.skipped.length).toBe(2)
  expect(result.skipped.map(toName).sort()).toMatchSnapshot()
})
