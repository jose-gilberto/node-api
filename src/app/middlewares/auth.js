import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth.json'

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader)
        return res.status(401)
                  .json({ error: "Nenhum token foi enviado!" })

    const token_parts = authHeader.split(' ')
    
    if (!token_parts.length == 2)
        return res.status(401)
                  .json({ error: "Token inválido!" })

    const [ scheme, token ] = token_parts

    if (!/^Bearer$/i.test(scheme))
        return res.status(401)
                  .json({ error: "Erro de formatação no token!" })
    
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err)
            return res.status(401)
                      .json({ 
                            error: "Token inválido!",
                            msg: err
                        })
        
        req.userId = decoded.params.id
        return next()
    })

}