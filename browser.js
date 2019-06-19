import { oneLine } from 'common-tags'
import enhanceTestContext from '@ianwalter/bff/lib/enhanceTestContext'
import runTest from '@ianwalter/bff/lib/runTest'

window.testMap = {}

function handleTestArgs (name, tags, test = {}) {
  const testFn = tags.pop()
  const key = oneLine(name)
  Object.assign(test, { key, name: key, fn: testFn, tags })
  if (testFn && typeof testFn === 'function') {
    window.testMap[test.key] = test
  } else {
    return fn => {
      Object.assign(test, { fn, tags: testFn ? [...tags, testFn] : [] })
      window.testMap[test.key] = test
    }
  }
}

function test (name, ...tags) {
  handleTestArgs(name, tags)
}

test.skip = function skip (name, ...tags) {
  handleTestArgs(name, tags, { skip: true })
}

test.only = function only (name, ...tags) {
  handleTestArgs(name, tags, { only: true })
}

window.runTest = async function (testContext) {
  // Enhance the context passed to the test function with testing utilities.
  enhanceTestContext(testContext)

  // Extract the relevant test function from the map of tests.
  const { fn } = window.testMap[testContext.key]

  // Run the test!
  await runTest(testContext, fn)

  // If the test failed, extract the data from the Error instance into a POJO so
  // that it can be returned to the node process via JSON.
  if (testContext.result.failed) {
    const { message, stack } = testContext.result.failed
    testContext.result.failed = { message, stack }
  }

  return testContext.result
}

export { test }
