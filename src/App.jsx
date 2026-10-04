import { useState } from "react"


    function cleanWiktionaryText(text) {
  return text
    .replace(/\{\{doublet\|[^}]*\}\}/g, "")
    .replace(/\{\{noncog\|[^}]*\}\}/g, "")
    .replace(/\{\{dercat\|[^}]*\}\}/g, "")
    .replace(/\{\{der\|[^}]*\}\}/g, "")
    .replace(/\{\{m\|[^}]*\}\}/g, "")
    .replace(/\{\{R:[^}]*\}\}/g, "")
    .replace(/\{\{etymon\|[^}]*\}\}/g, "")
    .replace(/\{\{inh\+?\|[^|}]*\|[^|}]*\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/\{\{cog\|[^}]*\|([^|}]+)\}\}/g, "$1")
    .replace(/\{\{ref\|[^}]*\}\}/g, "")
    .trim()
}


function App() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState("")
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(false)

async function handleSearch() {
  if (!word.trim()) {
    alert("Please enter a word.")
    return
  }

  setLoading(true)

  try {
    const response = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=tocdata&format=json&origin=*`
    )

    console.log("Selected language:", language)

    const data = await response.json()

    const sections = data.parse.tocdata.sections

    const languageNames = {
      en: "English",
      es: "Spanish",
      ru: "Russian",
    }

    const selectedLanguageName = languageNames[language]

    const languageIndex = sections.findIndex(
      (section) => section.line === selectedLanguageName
    )

    console.log("Selected language section:", selectedLanguageName)
    console.log("Language section index:", languageIndex)

    const etymologyIndex = sections.findIndex(
      (section, index) =>
        index > languageIndex && section.line.startsWith("Etymology")
    )

    console.log("Etymology section index:", etymologyIndex)

    const etymologySection = sections[etymologyIndex]

    const etymologyResponse = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&section=${etymologySection.index}&format=json&origin=*`
    )

    const etymologyData = await etymologyResponse.json()

    const etymologyText = etymologyData.parse.wikitext["*"]

    const etymologyOnly = etymologyText
      .replace(/^===Etymology.*?===\s*/, "")
      .split(/\n====/)[0]
      .split("Some have proposed")[0]
      .trim()

    const cleanText = cleanWiktionaryText(etymologyOnly)

    setResult(cleanText)
  } catch (error) {
    console.error(error)
    alert("Something went wrong. Please try again.")
  } finally {
    setLoading(false)
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

      <button onClick={handleSearch} disabled={loading}>
  {loading ? "Searching..." : "Search"}
</button>

      <p>You entered: {word}</p>
      <p>{result}</p>
    </div>
  )
}

export default App