const tesseract = require('../lib/tesseract')
const { expect } = require('chai')

describe('tesseract', function () {
  it('recognize', async function () {
    let fileName = './data/tesseract.jpg'
    let text = tesseract.recognize(fileName, 'eng')
    expect(text).to.be.a('string')
  })
})
