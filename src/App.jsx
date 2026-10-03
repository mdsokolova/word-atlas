import { useState } from "react"

function App() {
  const [word, setWord] = useState("")

  function handleSearch() {
    console.log("Searching for:", word)
  }

  return (
    <div>
      <h1>WORD ATLAS</h1>
      <p>Explore the history of words across languages.</p>

      <input
        type="text"
        placeholder="Enter a word..."
        value={word}
        onChange={(event) => setWord(event.target.value)}
      />

      <button onClick={handleSearch}>
        Search
      </button>

      <p>You entered: {word}</p>
    </div>
  )
}

export default App