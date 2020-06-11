const { test, run } = require('@ianwalter/bff')

const toName = ({ name, err }) => name + (err ? `: ${err}` : '')

test('bff-puppeteer', async t => {
  const result = await run({ plugins: ['.'] })
  t.expect(result.filesRegistered).toBe(3)
  t.expect(result.testsRegistered).toBe(8)
  t.expect(result.testsRun).toBe(8)
  t.expect(result.passed.length).toBe(3)
  t.expect(result.passed.map(toName).sort()).toMatchSnapshot()
  t.expect(result.failed.length).toBe(2)
  t.expect(result.failed.map(toName).sort()).toMatchSnapshot()
  t.expect(result.skipped.length).toBe(3)
  t.expect(result.skipped.map(toName).sort()).toMatchSnapshot()
})
