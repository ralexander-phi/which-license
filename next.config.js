const prod = process.env.NODE_ENV === 'production'

module.exports = {
  assetPrefix: prod ? '/which-license/' : '',
}

