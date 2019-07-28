const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())

let persons = [

          { 
            name: "Arto Hellas", 
            number: "040-123456",
            id: 1
          },
          { 
            name: "Ada Lovelace", 
            number: "39-44-5323523",
            id: 2
          }
        ]

  
  const generateId = () => Math.floor(Math.random()*99999999)

  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/info', (request, response) => {
    response.setHeader('Content-Type', 'text/html')
    response.write(`<p>Phonebook has info for ${persons.length} peoples</p>`)
    response.write(String(new Date()))
    response.end()
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

  
  app.post('/api/persons', (request, response) => {
    const body = request.body

    // check if the body has all the required information
    if (!body) {
        return response.status(400).json({error: 'content missing'})
    } else if (!body.name) {
        return response.status(422).json({error: 'name missing'})
    } else if (!body.number) {
        return response.status(422).json({error: 'number missing'})
    }

    // check if the person already exists in the database
    const personExists = persons.find(person => person.name === body.name)
    if (personExists) {
        return response.status(409).json({error: 'name already in database'})
    }

    const person = {
      name: body.name,
      number: String(body.number),
      id: generateId(),
    }

    persons = persons.concat(person)
  
    response.json(person)
  })
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.find(person => person.id !== id)
  
    response.status(204).end()
  })

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})