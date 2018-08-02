import express from 'express'

const router = express.Router()

router.get('/', async (req, res) => {
    res.send('Hello World!')
})

module.exports = app => app.use('/', router)