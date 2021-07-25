class UserRepository{
    constructor(connection){
        this.connection = connection
        connection.connect()
        this.disponibility = 8
    }

    createUser = async (username, res) => {
        try{
            this.connection.query(`insert into users (username) values ("${username}");`, 
                (err, { insertId }) => {
                    if(err) throw err
                    res.json({
                        id: insertId,
                        username: username
                    })
                })

        } catch(err) {
            throw err
        } finally {
            this.connection.end()
        }
    }

    takeResource = async (id, resources, res) => {
        
        for(const [hour, state] of Object.entries(resources)){
            if(state) this.connection.query(`insert into taken_resources (hour, user_id) values ("${hour}","${id}")`)
        }

        res.sendStatus(200)
    }

    quantityByHour = async (hour, res) => {
        this.connection.query(`select id from taken_resources where hour="${hour}"`,
        (err, result, fields) => {
            if(err) throw err
            res.send({ quantity: this.disponibility - result.length })
        })        
    }

    login = (username, callback) => {
        this.connection.query(`select * from users where username="${username}"`,
        (err, result, fields) => {
            if(err) throw err
            callback(result[0])
        })
    }

    hourIsTaken = (id, hour, callback) => {
        this.connection.query(`select * from taken_resources where (id=${id} and hour="${hour}")`,
        (err, result, fields) => {
            if(err) throw err
            callback(result)
        })
    }

    cleanup = () => {
        console.log('\nDoing cleanup...')
        this.connection.end()
    }
}

module.exports = UserRepository