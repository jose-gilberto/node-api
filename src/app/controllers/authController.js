import express from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sanitize from 'mongo-sanitize'

import User from '../models/User'

import authConfig from '../../config/auth.json'
import mailer from '../../modules/mailer'

const router = express.Router()

function generateToken(params = {}) {
    return jwt.sign({ params }, authConfig.secret, {
        expiresIn: 86400
    })
}

router.post('/register', async (req, res) => {
    const { email } = req.body
    
    try {
        if  (await User.findOne({ email })) {
            return res.status(400)
                      .json({
                          mensagem: 'Erro ao cadastrar usuário!',
                          error: 'Já Existe um usuário com esse email.'
                      })
        }
        
        const user = await User.create(req.body)

        user.password = undefined

        return res.send({ 
            user,
            token: generateToken({ id: user.id })
        })
    } catch (error) {
        res.status(500)
           .json({ 
               mensagem: 'Registration failed!',
               error: error
            })
    }
})

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')

    if (!user) 
        return res.status(400)
                    .json({
                        mensagem: "Erro ao autenticar usuário, credenciais inválidas!"
                    })

    if (!await bcryptjs.compare(password, user.password))
        return res.status(400)
                    .json({
                        mensagem: "Erro ao autenticar usuário, credenciais inválidas!"
                    })

    user.password = undefined

    res.status(200)
        .json({
            user,
            token: generateToken({ id: user.id }) 
        })
})

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body
    
    try {
        const user = await User.findOne({ email })

        if (!user)
            return res.status(400)
                      .json({ error: 'Usuário não encontrado!' })
        
        const token = crypto.randomBytes(20).toString('hex')
        
        const now = new Date()
        now.setHours(now.getHours() + 1)
        
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        })

        mailer.sendMail({
            'to': email,
            'from': 'gilberto@mail.to',
            'template': 'auth/forgot_password',
            'context': { token }
        }, (err) => {
            if (err)
                res.status(400)
                   .json({
                       error: 'Não foi possível enviar o email de recuperação de senha, tente novamente!'
                   })
            
            res.send()
        })
    } catch (error) {
        res.status(400)
           .send({
               error: 'Erro ao tentar recuperar senha, tente novamente!'
           })    
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body

    try {
        const user = await User.findOne({ email })
                               .select('+passwordResetToken passwordResetExpires')

        if (!user)
            return res.status(400)
                      .json({
                          error: 'Usuário não encontrado!'
                      })
        
        if (token !== user.passwordResetToken)
            return res.status(400)
                      .json({
                          error: 'Token inválido'
                      })

        const now = new Date()

        if (now > user.passwordResetExpires)
            return res.status(400)
                      .json({
                          error: 'Token expirádo! Gere um novo token.'
                      })

        user.password = password

        await user.save()

        res.send()
    } catch (error) {
        res.status(400)
           .json({
               error: 'Não foi possível resetar a sua senha, tente novamente!'
           })
    }
})

module.exports = app => app.use('/auth', router)