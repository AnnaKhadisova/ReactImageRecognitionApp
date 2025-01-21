import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt-nodejs';
import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    //port: 3306,
    user: 'annakhadisova',
    password: '200920',
    database: 'smart-brain',
  },
});

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());


app.post('/clarifai', async (req, res) => {
  const PAT = '2befe759f26b4695ba27750a2ef893c3';
  const USER_ID = '200920';
  const APP_ID = 'my-first-application-3gvpkf';
  const MODEL_ID = 'face-detection';
  const { imageUrl } = req.body;

  const raw = JSON.stringify({
    "user_app_id": {
      "user_id": USER_ID,
      "app_id": APP_ID
    },
    "inputs": [
      {
        "data": {
          "image": {
            "url": imageUrl
          }
        }
      }
    ]
  });

  const requestOptions = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Key ' + PAT
    },
    body: raw
  };

  try {
    const response = await fetch(`https://api.clarifai.com/v2/models/${MODEL_ID}/outputs`, requestOptions);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Clarifai API:', error);
    res.status(500).json({ error: 'Failed to fetch data from Clarifai API' });
  }
});

// the second part

app.get('/', (req, res) => {
  res.send(database.users);
})

app.post('/signin', (req, res) => {
  db.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', req.body.email)
          .then(user => {
            res.json(user[0])
          })
          .catch(err => res.status(400).json('unable to get user'))
      } else {
        res.status(400).json('wrong credentials')
      }
    })
    .catch(err => res.status(400).json('wrong credentials'))
})

app.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx.insert({
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0].email,
            name: name,
            joined: new Date()
          })
          .then(user => {
            res.json(user[0]);
          })
      })
      .then(trx.commit)
      .catch(trx.rollback)
  })

})

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  db.select('*').from('users').where({ id: id }).then(user => {
    if (user.length) {
      res.json(user[0])
    } else { res.status(400).json('Not found') }
  })
    .catch(err => res.status(400).json('error getting user'))
})

app.put('/image', (req, res) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
      res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
