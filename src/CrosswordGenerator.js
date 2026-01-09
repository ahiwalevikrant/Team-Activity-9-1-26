import React, { useState } from 'react';

const CrosswordGenerator = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [crossword, setCrossword] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});

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

  // Mock crossword data for demo
  const mockCrossword = {
    grid: [
      ["V", "I", "K", "R", "A", "N", "T"],
      ["", "", "", "E", "", "", ""],
      ["", "", "", "A", "", "", ""],
      ["A", "B", "H", "I", "S", "H", "E", "K"],
      ["", "", "", "T", "", "", ""],
    ],
    words: [
      {
        answer: "VIKRANT",
        clue: "UI developer who masters Angular and React (7)",
        number: 1,
        row: 0,
        col: 0,
        direction: "across",
        length: 7
      },
      {
        answer: "ABHISHEK",
        clue: "Backend wizard with Java and SpringBoot expertise (8)",
        number: 2,
        row: 3,
        col: 0,
        direction: "across",
        length: 8
      },
      {
        answer: "REACT",
        clue: "Modern UI framework favored by our frontend team (5)",
        number: 3,
        row: 0,
        col: 3,
        direction: "down",
        length: 5
      }
    ]
  };

  const generateCrossword = () => {
    // For demo purposes, just show the mock crossword
    setCrossword(mockCrossword);
    setUserAnswers({});
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
    
    if (!userAnswer) return '';
    return userAnswer === correctAnswer ? 'correct' : 'incorrect';
  };

  const getWordNumber = (row, col) => {
    if (!crossword) return null;
    const word = crossword.words.find(w => w.row === row && w.col === col);
    return word ? word.number : null;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>VDSA Crossword Puzzle</h1>
        <p>Transform team data into an interlocking crossword puzzle</p>
      </div>

      <div className="grid-layout">
        {/* Left side - Input */}
        <div className="card input-section">
          <h2>Team Data Input</h2>
          <textarea
            placeholder={sampleData}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
          />
          <button
            onClick={generateCrossword}
            disabled={!jsonInput}
            className="btn btn-primary"
          >
            Generate Crossword
          </button>
        </div>

        {/* Right side - Crossword Grid */}
        {crossword && (
          <div className="card">
            <div className="crossword-header">
              <h2>Puzzle Grid</h2>
              <div className="button-group">
                <button onClick={checkAnswers} className="btn btn-success">
                  Check
                </button>
                <button
                  onClick={() => {
                    setCrossword(null);
                    setUserAnswers({});
                  }}
                  className="btn btn-secondary"
                >
                  New Puzzle
                </button>
              </div>
            </div>
            
            <div className="crossword-container">
              {crossword.grid.map((row, r) => (
                <div key={r} className="grid-row">
                  {row.map((cell, c) => {
                    const wordNum = getWordNumber(r, c);
                    return (
                      <div
                        key={c}
                        className={`grid-cell ${cell ? getCellColor(r, c) : 'empty'}`}
                      >
                        {wordNum && (
                          <span className="cell-number">{wordNum}</span>
                        )}
                        {cell && (
                          <input
                            type="text"
                            maxLength={1}
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

            {/* Clues below the grid */}
            <div className="clues-section" style={{marginTop: '2rem'}}>
              <h2>Clues</h2>
              <div className="clues-group">
                <h3>Across</h3>
                {crossword.words
                  .filter(w => w.direction === 'across')
                  .map(w => (
                    <div key={w.number} className="clue-item">
                      <span className="clue-number">{w.number}.</span> {w.clue}
                    </div>
                  ))}
              </div>
              <div className="clues-group">
                <h3>Down</h3>
                {crossword.words
                  .filter(w => w.direction === 'down')
                  .map(w => (
                    <div key={w.number} className="clue-item">
                      <span className="clue-number">{w.number}.</span> {w.clue}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrosswordGenerator;