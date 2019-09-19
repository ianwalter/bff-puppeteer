const path = require('path')
const { Print, chalk } = require('@ianwalter/print')
const merge = require('@ianwalter/merge')
const tempy = require('tempy')

const pptrRegex = /pptr\.js$/

let print
let fileServer

module.exports = {
  async before (context) {
    print = new Print({ level: context.logLevel })

    // Construct the default Puppeteer / Webpack configuration.
    const puppeteer = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      webpack: {
        mode: 'development',
        resolve: {
          alias: {
            fs: path.join(__dirname, 'fs.js'),
            '@ianwalter/bff-puppeteer': path.join(__dirname, 'browser.js')
          }
        },
        plugins: []
      }
    }

    // If running in the Puppeteer Docker container, configure Puppeteer to use
    // the instance of Google Chrome that is already installed.
    if (process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) {
      puppeteer.executablePath = 'google-chrome-unstable'
    }

    // Merge the default Puppeteer configuration with the user supplied
    // configuration.
    context.puppeteer = merge(puppeteer, context.puppeteer)

    // Create the fs-remote file server so that jest-snapshot can work in the
    // browser.
    if (context.puppeteer.all || context.files.some(f => pptrRegex.test(f))) {
      const createServer = require('fs-remote/createServer')
      fileServer = createServer()
      fileServer.listen()
      context.fileServerPort = `${fileServer.address().port}`
      print.debug('Set fileServerPort to', context.fileServerPort)
    }
  },
  async registration (file, context) {
    print = new Print({ level: context.logLevel })
    print.debug('bff-puppeteer registration', chalk.gray(file.relativePath))

    // Add Puppeteer config to the test file context if all tests are marked as
    // Puppeteer tests or the file name contains .pptr as part of the extension.
    if (context.puppeteer.all || pptrRegex.test(file.path)) {
      try {
        const webpack = require('webpack')
        const puppeteer = require('puppeteer')
        const merge = require('@ianwalter/merge')

        // Create a temporary path for the compiled test file.
        const compiledPath = tempy.file({ extension: 'js' })
        const webpackDefault = {
          entry: file.path,
          output: {
            path: path.dirname(compiledPath),
            filename: path.basename(compiledPath)
          }
        }
        file.puppeteer = {
          path: compiledPath,
          webpack: merge(webpackDefault, context.puppeteer.webpack)
        }

        // Define the constant FILE_SERVER_PORT so that the fs-remote client can
        // be compiled with the correct server address.
        file.puppeteer.webpack.plugins.push(
          new webpack.DefinePlugin({ FILE_SERVER_PORT: context.fileServerPort })
        )

        // Compile the test file using Webpack.
        print.debug('Compiling Puppeteer file', chalk.gray(file.puppeteer.path))
        const compiler = webpack(file.puppeteer.webpack)
        await new Promise((resolve, reject) => {
          compiler.run(err => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })

        // Launch a Puppeteer browser instance and create a new page.
        context.browser = await puppeteer.launch(context.puppeteer)
        context.page = await context.browser.newPage()

        // Store any error thrown in the following try catch so that the browser
        // can be closed before the error is thrown and execution of this worker
        // action terminates.
        let error
        try {
          // Add the compiled test file to the page.
          await context.page.addScriptTag({ path: file.puppeteer.path })

          // Return the test map that was stored on the window context when the
          // compiled script was added to the page.
          context.testMap = await context.page.evaluate(() => window.testMap)
        } catch (err) {
          error = err
        }

        // Close the Puppeteer instance now that registration has completed.
        await context.browser.close()

        // If there was an error during regisration, throw it now that the
        // browser instance has been cleaned up.
        if (error) {
          throw error
        }
      } catch (err) {
        print.error(err)
      }
    }
  },
  async beforeEach (file, context) {
    if (file.puppeteer) {
      // Launch a Puppeteer browser instance and create a new page.
      const puppeteer = require('puppeteer')
      context.browser = await puppeteer.launch(context.puppeteer)
      context.page = await context.browser.newPage()
    }
  },
  async runTest (file, context) {
    if (file.puppeteer) {
      // Add the compiled file to the page.
      await context.page.addScriptTag({ path: file.puppeteer.path })

      // Run the test in the browser and add the result to the local
      // testContext.
      context.testContext.result = await context.page.evaluate(
        testContext => window.runTest(testContext),
        context.testContext
      )
      context.testContext.hasRun = true

      // If the test failed, re-hydrate the JSON failure data into an Error
      // instance.
      if (context.testContext.result.failed) {
        const { message, stack } = context.testContext.result.failed
        context.testContext.result.failed = new Error(message)
        context.testContext.result.failed.stack = stack
      }
    }
  },
  async afterEach (file, context) {
    // Close the Puppeteer instance now that the test has completed.
    if (file.puppeteer && context.browser) {
      await context.browser.close()
    }
  },
  async after () {
    // If the file server used to serve snapshot files to the browser is
    // running, try to close it.
    if (fileServer) {
      fileServer.close()
    }
  }
}
