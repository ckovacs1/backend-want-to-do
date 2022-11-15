const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.get('/profile', (req,res) => {
    res.json(
        {
            "profiles": [
                {
                    name: 'Charles Leclerc',
                    email: 'cleclerc@gmail.com',
                    bio: 'Charles Perceval Leclerc is a Monégasque racing driver, currently racing in Formula One for Scuderia Ferrari. He won the GP3 Series championship in 2016 and the FIA Formula 2 Championship in 2017.'
                },
                {
                    name: 'Lewis Hamilton',
                    email: 'lhamilton@mercedes.com',
                    bio: 'In Formula One, Hamilton has won a joint-record seven World Drivers Championship titles, and holds the records for the most wins, pole positions, and podium finishes, among others'
                },
                {
                    name: 'Nicolas Latifi',
                    email: 'test',
                    bio: 'test'
                }
            ]
        }
       
    );
})

app.listen(8080, () => {
    console.log('Server on port 8080')
})