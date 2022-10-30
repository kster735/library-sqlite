import 'dotenv/config'
import express from 'express'
import {create} from 'express-handlebars'
import {router} from './routes.js'
import session from 'express-session'
import createMemoryStore from 'memorystore'

const MemoryStore = createMemoryStore(session)

const myBooksSession = session({
    secret: process.env.SESSION_SECRET,
    store: new MemoryStore({checkPeriod: 86400*1000}),
    resave: false,
    saveUninitialized: false,
    name: 'library', // connect.sid
    cookie:{
        maxAge: 1000*60*20 // 20 minutes
    }
})

const app = express()

const ehbs = create({ 
    helpers:{
        inc: function(x){ return x + 1}
    }
})
app.engine('handlebars', ehbs.engine)
app.set('view engine', 'handlebars')
app.set('views', './views')

app.use(myBooksSession)
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}))



app.use('/', router)

app.use((req, res) =>{
    res.redirect('/');
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Η εφαρμογή ξεκίνησε στη θύρα -> ${PORT}`)
})