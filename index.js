const express           = require('express')
const mysql             = require('mysql')
const connectionConfig  = require('./config/db')
const UserRepository    = require('./repository/UserRepository')
const cleanup           = require('./cleanup')
const { user } = require('./config/db')

const app = express()
const PORT = process.env.PORT || 8000


const connection = mysql.createConnection(connectionConfig)

const userRepository = new UserRepository(connection)

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*') 
    /* 'Authorization, X-API-KEY, Origin, X-Requested-With',
    'Content-Type', 'Accept', 'Access-Control-Allow-Request-Method') */
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
})


app.post('/create-user', async (req, res) => {
    const { username } = req.query
    
    if(!username)
        res.badRequest()

    try{
        await userRepository.createUser(username, res)
    } catch(err){
        throw err
    }
})

app.post('/take-resources', async (req, res) => {
    const { id } = req.query
    if(!id)
        res.sendStatus(400)

    const { resourcesToSave } = req.body
    userRepository.takeResource(id, resourcesToSave, res)
})

app.get('/disponibility', async (req, res) => {
    const { hour } = req.query
    userRepository.quantityByHour(hour, res)
    
})

app.get('/hour-is-taken', (req, res) => {
    const { id, hour } = req.query
    userRepository.hourIsTaken(id, hour, result => {
        if(result.length >= 1) res.send({ hourIsTaken: true })
        else res.send({ hourIsTaken: false }) 
    })
})

app.post('/login', (req, res) => {
    const { username } = req.query
    userRepository.login(username, ({username, id}) => {
        res.send({ username: username, id: id})
    })
})

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

cleanup.Cleanup(() => userRepository.cleanup())