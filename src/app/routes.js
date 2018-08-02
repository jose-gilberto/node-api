import fs from 'fs'
import path from 'path'

export default app => {
    fs.readdirSync(path.join(__dirname, 'controllers'))
      .filter(file => ((file.indexOf('.')) !== 0 && (file !== "routes.js") && (file !== "index.js")))
      .forEach(file => {
          require(path.join(__dirname, 'controllers', file))(app)
      })
}