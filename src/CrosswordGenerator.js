import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const CrosswordGenerator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crossword, setCrossword] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [error, setError] = useState('');

  const sampleData = `[
  {
    "name": "Vikrant",
    "title": "UI Dev",
    "skills": "Angular React Java",
    "phone": "ext 44211"
  },
  {
    "name": "Abhishek",
    "title": "Backend Dev",
    "skills": "Java SpringBoot",
    "phone": "ext 55123"
  }
]`;

  const generateCrossword = async () => {
    setLoading(true);
    setError('');
    setCrossword(null);
    setUserAnswers({});

    try {
      const teamData = JSON.parse(jsonInput);
      
      // Step 1: Generate clues using Claude API
      const cluesResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sk-a"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Generate creative, cryptic crossword clues for these team members. For each person, create clues based on their name, title, skills, and phone extension.

Team data: ${JSON.stringify(teamData, null, 2)}

Return ONLY valid JSON (no markdown, no preamble) in this exact format:
{
  "clues": [
    {
      "answer": "ALICE",
      "clue": "Cryptic clue here",
      "direction": "across"
    }
  ]
}

Make clues witty and cryptic. Include clues for names, key skills, titles, and phone extensions. Vary between across and down directions.`
            }
          ]
        })
      });

      const cluesData = await cluesResponse.json();
      const cluesText = cluesData.content.find(c => c.type === "text")?.text || "";
      const cleanedClues = cluesText.replace(/```json\n?|\n?```/g, "").trim();
      const { clues } = JSON.parse(cleanedClues);

      // Step 2: Generate crossword layout using Claude
      const layoutResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 3000,
          messages: [
            {
              role: "user",
              content: `Create an interlocking crossword puzzle layout for these clues. Words must intersect where they share letters.

Clues: ${JSON.stringify(clues, null, 2)}

Return ONLY valid JSON (no markdown, no preamble) with this structure:
{
  "grid": [
    ["A", "L", "I", "C", "E"],
    ["", "", "", "O", ""],
    ["B", "O", "B", "", ""]
  ],
  "words": [
    {
      "answer": "ALICE",
      "clue": "the clue text",
      "number": 1,
      "row": 0,
      "col": 0,
      "direction": "across",
      "length": 5
    }
  ]
}

Rules:
- Make words interlock at shared letters
- Use uppercase letters
- Empty cells are empty strings
- Number words sequentially (across first, then down)
- Grid should be compact and efficiently use space`
            }
          ]
        })
      });

      const layoutData = await layoutResponse.json();
      const layoutText = layoutData.content.find(c => c.type === "text")?.text || "";
      const cleanedLayout = layoutText.replace(/```json\n?|\n?```/g, "").trim();
      const puzzle = JSON.parse(cleanedLayout);

      setCrossword(puzzle);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellInput = (row, col, value) => {
    const key = `${row}-${col}`;
    setUserAnswers(prev => ({
      ...prev,
      [key]: value.toUpperCase()
    }));
  };

  const checkAnswers = () => {
    if (!crossword) return;
    
    const newAnswers = { ...userAnswers };
    crossword.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          const key = `${r}-${c}`;
          const userAnswer = newAnswers[key] || '';
          newAnswers[key] = userAnswer === cell ? userAnswer : '';
        }
      });
    });
    setUserAnswers(newAnswers);
  };

  const getCellColor = (row, col) => {
    const key = `${row}-${col}`;
    const correctAnswer = crossword.grid[row][col];
    const userAnswer = userAnswers[key];
    
    if (!userAnswer) return 'bg-white';
    return userAnswer === correctAnswer ? 'bg-green-100' : 'bg-red-100';
  };

  const getWordNumber = (row, col) => {
    if (!crossword) return null;
    const word = crossword.words.find(w => w.row === row && w.col === col);
    return word ? word.number : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
             VDSA Crossword Puzzle
          </h1>
          <p className="text-gray-600">
            Transform team data into an interlocking crossword puzzle
          </p>
        </div>

        {!crossword && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Team Data Input</h2>
            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder={sampleData}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
            />
            <button
              onClick={generateCrossword}
              disabled={loading || !jsonInput}
              className="mt-4 w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Generating Puzzle...
                </>
              ) : (
                'Generate Crossword'
              )}
            </button>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {crossword && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Puzzle Grid</h2>
                <div className="space-x-2">
                  <button
                    onClick={checkAnswers}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Check
                  </button>
                  <button
                    onClick={() => {
                      setCrossword(null);
                      setUserAnswers({});
                    }}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                  >
                    New Puzzle
                  </button>
                </div>
              </div>
              
              <div className="inline-block">
                {crossword.grid.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((cell, c) => {
                      const wordNum = getWordNumber(r, c);
                      return (
                        <div
                          key={c}
                          className={`w-12 h-12 border border-gray-400 relative ${
                            cell ? getCellColor(r, c) : 'bg-gray-800'
                          }`}
                        >
                          {wordNum && (
                            <span className="absolute top-0 left-1 text-xs font-bold text-gray-600">
                              {wordNum}
                            </span>
                          )}
                          {cell && (
                            <input
                              type="text"
                              maxLength={1}
                              className="w-full h-full text-center text-xl font-bold uppercase bg-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                              value={userAnswers[`${r}-${c}`] || ''}
                              onChange={(e) => handleCellInput(r, c, e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Clues</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-purple-700">Across</h3>
                  <div className="space-y-2">
                    {crossword.words
                      .filter(w => w.direction === 'across')
                      .map(w => (
                        <div key={w.number} className="text-sm">
                          <span className="font-semibold">{w.number}.</span> {w.clue}
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-blue-700">Down</h3>
                  <div className="space-y-2">
                    {crossword.words
                      .filter(w => w.direction === 'down')
                      .map(w => (
                        <div key={w.number} className="text-sm">
                          <span className="font-semibold">{w.number}.</span> {w.clue}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrosswordGenerator;