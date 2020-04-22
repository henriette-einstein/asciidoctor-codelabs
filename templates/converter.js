'use strict'
const fs = require('fs')
const path = require('path')
const ejs = require('ejs')

/**
 * Return a map of template files
 * @param {string} extension the extension to use
 */
function getTemplates (directory, extension) {
  return fs
    .readdirSync(directory)
    .filter(
      (item) =>
        fs.statSync(path.join(directory, item)).isFile() &&
        (extension === undefined || path.extname(item) === extension)
    )
    .sort()
}

class CodelabsConverter {
  constructor (baseConverter) {
    this.templates = []
    this.addTemplateDirectory()
    this.baseConverter = baseConverter
  }

  addTemplate (nodeName, template) {
    this.templates[nodeName] = template
  }

  addTemplateFile (nodeName, fileName) {
    const templateString = fs.readFileSync(fileName).toString()
    const template = ejs.compile(templateString, {})
    this.addTemplate(nodeName, template)
  }

  addTemplateDirectory (extension = '.ejs') {
    getTemplates(__dirname, extension).forEach((file) => {
      const filePath = path.resolve(__dirname, file)
      const fileName = path.parse(file).name
      this.addTemplateFile(fileName, filePath)
    })
  }

  convert (node, transform) {
    const nodeName = transform || node.getNodeName()
    if (this.templates[nodeName] !== undefined) {
      return this.templates[nodeName]({ node: node })
    } else {
      return this.baseConverter.convert(node, transform)
    }
  }
}

module.exports.configure = function (asciidoctor) {
  const baseConverter = asciidoctor.Html5Converter.create()
  asciidoctor.ConverterFactory.register(new CodelabsConverter(baseConverter), ['html5'])
}
