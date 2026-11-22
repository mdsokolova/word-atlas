import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addFavorite, removeFavorite } from "./features/favorites/favoritesSlice"
import "./App.css"


    function cleanWiktionaryText(text) {
  return text
    .replace(/\{\{doublet\|[^}]*\}\}/g, "")
    .replace(/\{\{bor\+?\|[^|}]*\|[^|}]*\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/\{\{noncog\|[^}]*\}\}/g, "")
    .replace(/\{\{unc\|[^|}]*\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/<ref>[\s\S]*?<\/ref>/g, "")
    .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/''([^']+)''/g, "$1")
    .replace(/\{\{dercat\|[^}]*\}\}/g, "")
    .replace(/\{\{der\|[^|}]*\|[^|}]*\|([^|}]+)[^}]*\}\}/g, (_, value) =>
  value === "-" ? "" : value
)
    .replace(/\{\{m\|[^|}]*\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/\{\{R:[^}]*\}\}/g, "")
    .replace(/\{\{etymon\|[^}]*\}\}/g, "")
    .replace(/\{\{ety\|[^}]*\}\}/g, "")
    .replace(/\{\{inh\+?\|[^|}]*\|[^|}]*\|([^|}]+)[^}]*\}\}/g, "$1")
    .replace(/\{\{cog\|[^}]*\|([^|}]+)\}\}/g, "$1")
    .replace(/\{\{ref\|[^}]*\}\}/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/\{\{PIE word\|[^}]*\}\}/g, "")
    .trim()
}


function extractEtymology(text) {
  const matches = [
    ...text.matchAll(
      /\{\{inh\+?\|[^|}]+\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}\}/g
    ),
  ]

  const languageNames = {
    enm: "Middle English",
    ang: "Old English",
    "gmw-pro": "Proto-West Germanic",
    "gem-pro": "Proto-Germanic",
    "ine-pro": "Proto-Indo-European",
    la: "Latin",
"itc-pro": "Proto-Italic",
orv: "Old Russian",
"sla-pro": "Proto-Slavic",
"ine-bsl-pro": "Proto-Balto-Slavic",
  }

  return matches.map((match) => ({
    language: languageNames[match[1]] || match[1],
    word: match[2],
  }))
}

function extractPIEOrigin(text) {
  const match = text.match(
    /\{\{PIE word\|[^|}]+\|([^|}]+)/
  )

  return match ? match[1] : null
}

function extractCognates(text) {
  const matches = [
    ...text.matchAll(
      /\{\{cog\|([^|}]+)\|([^|}]+)(?:\|[^}]*)?\}\}/g
    ),
  ]

  const languageNames = {
    sa: "Sanskrit",
    la: "Latin",
    en: "English",
    de: "German",
    grc: "Ancient Greek",
  }

  return matches.map((match) => ({
    language: languageNames[match[1]] || match[1],
    word: match[2],
  }))
}



function App() {
  const [word, setWord] = useState("")
  const [result, setResult] = useState("")
  const [language, setLanguage] = useState("en")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const favorites = useSelector((state) => state.favorites)
  const [filterLanguage, setFilterLanguage] = useState("all")
  const filteredFavorites =
  filterLanguage === "all"
    ? favorites
    : favorites.filter(
        (favorite) => favorite.language === filterLanguage
      )

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
if (!data.parse) {
  setResult(`No Wiktionary page was found for "${word}".`)
  return
}
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

  const nextLanguageIndex = sections.findIndex(
  (section, index) =>
    index > languageIndex &&
    ["English", "Spanish", "Russian"].includes(section.line)
)

const languageEndIndex =
  nextLanguageIndex === -1 ? sections.length : nextLanguageIndex

const etymologyIndex = sections.findIndex(
  (section, index) =>
    index > languageIndex &&
    index < languageEndIndex &&
    section.line.startsWith("Etymology")
)

    console.log("Etymology section index:", etymologyIndex)

    if (languageIndex === -1) {
  setResult(`No ${selectedLanguageName} entry was found for "${word}".`)
  return
}

if (etymologyIndex === -1) {
  setResult(`No etymology was found for "${word}".`)
  return
}

const etymologySection = sections[etymologyIndex]

    const etymologyResponse = await fetch(
      `https://en.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&section=${etymologySection.index}&format=json&origin=*`
    )

    const etymologyData = await etymologyResponse.json()

    const etymologyText = etymologyData.parse.wikitext["*"]
    console.log("RAW ETYMOLOGY:", etymologyText)

    
 const etymologyOnly = etymologyText
  .replace(/^===Etymology.*?===\s*/, "")
  .split("\n\n")[0]
  .trim()

const cleanText = cleanWiktionaryText(etymologyOnly)

const origins = extractEtymology(etymologyOnly)
  .map(({ language, word }) => `${word} — ${language}`)
  .join("\n")

  const pieOrigin = extractPIEOrigin(etymologyOnly)
  const cognates = extractCognates(etymologyText)

const cognateText = cognates
  .map(({ word, language }) => `${word} — ${language}`)
  .join("\n")

setResult(
  `${cleanText}\n\nHistorical language stages:\n${origins}${
    pieOrigin ? `\n\nProto-Indo-European origin:\n${pieOrigin}` : ""
  }${
    cognateText
      ? `\n\nRelated words (cognates):\n${cognateText}`
      : ""
  }`
)

  } catch (error) {
    console.error(error)
    alert("Something went wrong. Please try again.")
  } finally {
    setLoading(false)
  }
}
function handleSaveFavorite() {
  dispatch(
    addFavorite({
      id: `${language}-${word.toLowerCase()}`,
      word,
      language,
      etymology: result,
    })
  )
}

return (
  <div className="app">
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
     <div className="result-card">
  <h2>{word}</h2>
  <p style={{ whiteSpace: "pre-line" }}>{result}</p>
</div>

{result && (
  <button onClick={handleSaveFavorite}>
    Save to Favorites
  </button>
)}
<div className="favorites">
  <h2>My Favorites</h2>

  <select
  value={filterLanguage}
  onChange={(event) => setFilterLanguage(event.target.value)}
>
  <option value="all">All languages</option>
  <option value="en">English</option>
  <option value="es">Spanish</option>
  <option value="ru">Russian</option>
</select>

  {filteredFavorites.length === 0 ? (
    <p>No favorite words yet.</p>
  ) : (
    filteredFavorites.map((favorite) => (
      <div key={favorite.id} className="favorite-card">
        <h3>{favorite.word}</h3>
        <p>Language: {favorite.language}</p>
        <p>{favorite.etymology}</p>

        <button
          onClick={() => dispatch(removeFavorite(favorite.id))}
        >
          Remove
        </button>
      </div>
    ))
  )}
</div>
    </div>
  )
}

export default App