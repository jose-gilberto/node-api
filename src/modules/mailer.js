import nodeMailer from 'nodemailer'
import path from 'path'
import hbs from 'nodemailer-express-handlebars'
import { host, port, user, pass } from '../config/mail.json'

const transport = nodeMailer.createTransport({
    host,
    port,
    auth: { user, pass }
});

transport.use('compile', hbs({
    viewEngine: 'handlebars',
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html'
}))

export default transport