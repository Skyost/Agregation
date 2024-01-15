export default defineNitroPlugin((nitroApp) => {
  // @ts-ignore
  nitroApp.hooks.hook('content:file:beforeParse', (file) => {
    if (!file._id.endsWith('.md')) {
      return
    }
    file.body = file.body.replaceAll('https://agreg.skyost.eu/', '/')
  })
})
