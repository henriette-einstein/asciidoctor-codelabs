#!/usr/bin/env node

'use strict'

const { Options, Invoker, processor } = require('@asciidoctor/cli')
const converter = require('../templates/converter')
const pkg = require('../package.json')

class ExtendedInvoker extends Invoker {
  async invoke () {
    const processArgs = this.options.argv.slice(2)
    const { args } = this.options
    const { verbose, version, files } = args
    if (version || (verbose && processArgs.length === 1)) {
      this.showVersion()
      process.exit(0)
    }
    converter.configure(processor)
    Invoker.prepareProcessor(args, processor)
    const options = this.options.options
    const failureLevel = options.failure_level
    if (this.options.stdin) {
      await Invoker.convertFromStdin(options, args)
      Invoker.exit(failureLevel)
    } else if (files && files.length > 0) {
      Invoker.processFiles(files, verbose, args.timings, options)
      Invoker.exit(failureLevel)
    } else {
      this.showHelp()
      process.exit(0)
    }
  }

  version () {
    return `Asciidoctor with Codelabs support ${pkg.version} using ${super.version()}`
  }
}

async function run () {
  const options = new Options().parse(process.argv)
  return new ExtendedInvoker(options).invoke()
}

run()
  .then((result) => {
    if (result.exit) {
      process.exit(0)
    }
  })
  .catch((error) => {
    console.log('error', error)
    process.exit(1)
  })
