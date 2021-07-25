const express           = require('express')
const { Client }        = require('pg')
const UserRepository    = require('./repository/UserRepository')
const cleanup           = require('./cleanup')
console.log(require('dotenv').config())

const app = express()
const PORT = process.env.PORT || 8000


const connection = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

const userRepository = new UserRepository(connection)

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*') 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
    next()
})


app.post('/create-user', async (req, res) => {
    const { username } = req.query
    
    if(!username){
        res.sendStatus(400)
        return
    }

    try{
        const createdUser = await userRepository.createUser(username)
        res.json(createdUser)
    } catch(err){
        throw err
    }
})

app.post('/login', async (req, res) => {
    const { username } = req.query

    if(!username){
        res.sendStatus(400)
        return
    }

    try{
        const userLogged = await userRepository.login(username)
        res.json({ userLogged })
    } catch (err){
        res.sendStatus(500)
        throw err
    }
})

app.post('/take-resources', async (req, res) => {
    const { id } = req.query
    if(!id){
        res.sendStatus(400)
        return
    }

    const { resourcesToSave } = req.body
    try {
        const resourcesSaved = await userRepository.takeResource(id, resourcesToSave)
        res.json(resourcesSaved)
    } catch(err){
        throw err
    }
})


app.get('/disponibility', async (req, res) => {
    const { hour } = req.query
    try{
        const disponibility = await userRepository.quantityByHour(hour)
        res.json({ disponibility })
    } catch(err){
        throw err
    }   
})

app.get('/hour-is-taken', async (req, res) => {
    const { id, hour } = req.query
    try{
        const isTaken = await userRepository.hourIsTaken(id, hour)
        res.json(isTaken)
    } catch(err){
        throw err
    }
})

app.get('/', (req, res) => res.send('This is an API'))

app.listen(PORT, () => console.log(`Listening on port ${PORT}`))

cleanup.Cleanup(() => userRepository.cleanup()) 