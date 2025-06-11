import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const [jokes, setJokes] = useState([])

  const fetchJokes = async () => {
    const response = await axios.get('/api/jokes')
    console.log('API response:', response.data) // Debug: log the response
    setJokes(response.data)
  }

  useEffect(() => {
    fetchJokes()
  }, [])

  return (
    <>
      <div><h1>hi abhay singh</h1></div>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((joke, index) => (
          <div key={joke.id || index}>
            <p>{joke.content || joke.joke || JSON.stringify(joke)}</p>
          </div>
        ))
      }
    </>
  )
}

export default App
