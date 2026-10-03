import { useState } from "react"

function App() {
  const [word, setWord] = useState("")

async function handleSearch() {
  if (!word.trim()) {
    alert("Please enter a word.")
    return
  }

  const response = await fetch(
    `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=extracts&explaintext=1&format=json&origin=*`
  )

  const data = await response.json()

  console.log(data)
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