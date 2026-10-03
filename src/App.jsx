import { useState } from "react"




function App() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState("")
  const [language, setLanguage] = useState("en")

async function handleSearch() {
  if (!word.trim()) {
    alert("Please enter a word.")
    return
  }

  const response = await fetch(
    `https://en.wiktionary.org/w/api.php?action=query&titles=${encodeURIComponent(word)}&prop=extracts&explaintext=1&format=json&origin=*`
  )

  const data = await response.json()

const page = Object.values(data.query.pages)[0]

const etymologyMatch = page.extract.match(
  /=== Etymology 1 ===\n\n([\s\S]*?)(?=\n===)/
)

if (etymologyMatch) {
  setResult(etymologyMatch[1])
}
}

  return (
    <div>
      <h1>WORD ATLAS</h1>
      <p>Explore the history of words across languages.</p>

<select
  value={language}
  onChange={(event) => setLanguage(event.target.value)}
>
  <option value="en">English</option>
  <option value="es">Spanish</option>
  <option value="ru">Russian</option>
</select>

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
      <p>{result}</p>
    </div>
  )
}

export default App