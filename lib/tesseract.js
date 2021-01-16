const ffi = require('ffi-napi')
const os = require('os')
const fs = require('fs')
const path = require('path')

const DEFAULT_LANG = 'eng'
const LANG_DELIMITER = '+'

module.exports = {
  getLibPath() {
    let libDir = path.dirname(process.env.TESSDATA_PREFIX)
    if (!fs.statSync(libDir).isDirectory()) throw new Error('TESSDATA_PREFIX 环境变量没有设置')

    let libName = ''
    if (os.type() == 'Windows_NT') {
      //windows
      libName = 'libtesseract-4.dll'
    } else {
      libName = 'libtesseract.so.4.0.1'
    }

    let fileName = path.join(libDir, libName)
    if (!fs.existsSync(fileName)) throw new Error(`${fileName} 库文件不存在`)

    return fileName
  },

  getTessDataPath() {
    let file = process.env.TESSDATA_PREFIX
    if (!fs.statSync(file).isDirectory()) throw new Error('TESSDATA_PREFIX 环境变量没有设置')

    return file
  },

  getLibM() {
    let libPath = this.getLibPath()

    return ffi.Library(libPath, {
      TessVersion: ['string', []],
      TessBaseAPICreate: ['pointer', []],
      TessBaseAPIDelete: ['void', ['string']],
      TessBaseAPIInit3: ['int', ['string', 'string', 'string']],
      TessBaseAPIProcessPages: ['bool', ['string', 'string', 'string', 'int', 'string']],
      TessBaseAPIGetUTF8Text: ['string', ['string']],
    })
  },

  recognize(filename, lang = DEFAULT_LANG) {
    if (Array.isArray(lang)) {
      lang = lang.join(LANG_DELIMITER)
    }

    let libM = this.getLibM()
    let TESSDATA_PREFIX = this.getTessDataPath()
    let api = libM.TessBaseAPICreate()
    let rc = libM.TessBaseAPIInit3(api, TESSDATA_PREFIX, lang)
    if (rc) {
      libM.TessBaseAPIDelete(api)
      throw new Error('Could not initialize tesseract')
    }

    let text_out = libM.TessBaseAPIProcessPages(api, filename, null, 0, null)
    if (!text_out) throw new Error('Get text fail')

    let text = libM.TessBaseAPIGetUTF8Text(api)
    return text
  },
}
