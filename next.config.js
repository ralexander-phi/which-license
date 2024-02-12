const prod = process.env.NODE_ENV === 'production'

module.exports = {
  output: 'export',
  assetPrefix: prod ? '/which-license/' : '',
}

