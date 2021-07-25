class UserRepository{
    constructor(connection){
        this.connection = connection
        connection.connect().catch(e => { throw e })
        this.disponibility = 8
    }

    createUser = async username => {
        const queryText = 'INSERT INTO users (username) VALUES ($1) RETURNING *'
        const params = [ username ]
        try {
            const res = await this.connection.query(queryText, params)
            const { rows } = res
            return rows[0]
        } catch(err){
            throw err
        }
    }

    takeResource = async (id, resources) => {
        
        const queryText = 'INSERT INTO taken_resources (hour, user_id) VALUES ($1,$2)'
        const resourcesSaved = {}

        for(const [hour, state] of Object.entries(resources)){
            const params = [ hour, id ]
            if(state) {
                try{
                    await this.connection.query(queryText, params)
                    resourcesSaved[hour] = true
                } catch (err){
                    throw err
                }
                
            }
        }

        return resourcesSaved
    }

    quantityByHour = async hour => {
        const queryText = 'SELECT id FROM taken_resources WHERE hour=$1'
        const params = [ hour ]
        try{
            const res = await this.connection.query(queryText, params)
            const { rows } = res
            const disponibility = rows.length
            return (8 - disponibility)
        } catch(err){
            throw err
        }
        
    }

    login = async username => {
        const queryText = 'SELECT * FROM users WHERE username=$1'
        const params =[ username ]
        try{
            const res = await this.connection.query(queryText, params)
            const { rows } = res 
            return rows[0]
        } catch(err){
            throw err
        }
    }

    hourIsTaken = async (id, hour) => {
        const queryText = 'SELECT * FROM taken_resources WHERE (user_id=$1 and hour=$2)'
        const params = [ id, hour ]
        
        try{
            const res = await this.connection.query(queryText, params)
            const { rows } = res
            return Boolean(rows.length)
        } catch(err){
            throw err
        }
        
    }

    cleanup = () => {
        console.log('\nDoing cleanup...')
        this.connection.end()
    }
}

module.exports = UserRepository