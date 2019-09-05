require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', function (req) {
  return JSON.stringify(req['body'])
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })

  }

  next(error)
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const generateId = () => Math.floor(Math.random() * 99999999)

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons.map(person => person.toJSON()))
  })
})

app.get('/info', (request, response) => {
  response.setHeader('Content-Type', 'text/html')
  Person.find({}).then(persons => {
    response.write(`<p>Phonebook has info for ${persons.length} peoples</p>`)
    response.write(String(new Date()))
    response.end()
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body


  // check if the body has all the required information
  if (!body.name) {
    return response.status(422).json({ error: 'name missing' })
  } else if (!body.number) {
    return response.status(422).json({ error: 'number missing' })
  }

  const person = new Person({
    name: body.name,
    number: String(body.number),
    id: generateId()
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  console.log(request.params)
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})