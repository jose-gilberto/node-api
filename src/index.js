import express from 'express'
import bodyParser from 'body-parser'
import helmet from 'helmet'

import routes from './app/routes'

const app = express()

app.use(helmet())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:false }))

app.get('/', (req, res) => {
    res.send('Ok!')
})

routes(app)

app.listen(3000)

export default app