import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Cookies from "js-cookie";
import "./App.css";
import correctSound from "./sounds/correct.mp3";
import wrongSound from "./sounds/incorrect.mp3";

const App: React.FC = () => {
  const [num1, setNum1] = useState<number>(0);
  const [num2, setNum2] = useState<number>(0);
  const [operation, setOperation] = useState<string>("+");
  const [answer, setAnswer] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [score, setScore] = useState<number>(parseInt(Cookies.get("score") || "0"));
  const [health, setHealth] = useState<number>(parseInt(Cookies.get("health") || "3"));
  const [level, setLevel] = useState<string>("mudah");
  const [showMilestone, setShowMilestone] = useState<boolean>(false);
  const [milestoneMessage, setMilestoneMessage] = useState<string>("");
  const [lastMilestoneScore, setLastMilestoneScore] = useState<number>(Math.floor((parseInt(Cookies.get("score") || "0")) / 10) * 10);

  useEffect(() => {
    generateQuestion();
  }, [level, operation]);

  useEffect(() => {
    Cookies.set("score", score.toString(), { expires: 7 });
    Cookies.set("health", health.toString(), { expires: 7 });
    
    // Check for milestone
    const currentMilestone = Math.floor(score / 10) * 10;
    if (score > 0 && score % 10 === 0 && currentMilestone > lastMilestoneScore) {
      showMilestoneReached(score);
      setLastMilestoneScore(currentMilestone);
    }
  }, [score, health]);

  const generateNumber = (level: string) => {
    if (level === "mudah") return Math.floor(Math.random() * 10);
    if (level === "menengah") return Math.floor(Math.random() * 90) + 10;
    return Math.floor(Math.random() * 900) + 100;
  };

  const generateQuestion = () => {
    let n1 = generateNumber(level);
    let n2 = generateNumber(level);
    
    // For subtraction, ensure first number is >= second number
    if (operation === "-") {
      if (n1 < n2) {
        [n1, n2] = [n2, n1]; // Swap values
      }
    }
    
    // For multiplication in harder levels, use smaller numbers to avoid very large results
    if (operation === "×") {
      if (level === "menengah") {
        n1 = Math.floor(Math.random() * 20) + 1;
        n2 = Math.floor(Math.random() * 10) + 1;
      } else if (level === "sulit") {
        n1 = Math.floor(Math.random() * 30) + 1;
        n2 = Math.floor(Math.random() * 20) + 1;
      }
    }
    
    setNum1(n1);
    setNum2(n2);
    setMessage("");
    setAnswer("");
  };

  const playSound = (isCorrect: boolean) => {
    const sound = new Audio(isCorrect ? correctSound : wrongSound);
    sound.play();
  };

  const getMilestoneMessage = (score: number): string => {
    const messages = [
      { score: 10, message: "🚀 Luar Biasa! Otakmu mulai memancarkan energi kosmik!" },
      { score: 20, message: "🔥 Hebat! Kecepatan kalkulasimu melampaui batas kecepatan cahaya!" },
      { score: 30, message: "🌟 Brilian! Kemampuan matematikamu membuat Einstein bangga!" },
      { score: 40, message: "💫 Wow! Kamu membuka portal dimensi matematika baru!" },
      { score: 50, message: "🌠 Spektakuler! Kemampuanmu memancarkan energi ke seluruh galaksi!" },
      { score: 60, message: "⚡ Dahsyat! Kekuatan perhitunganmu menggetarkan semesta!" },
      { score: 70, message: "🌈 Menakjubkan! Kamu menguasai spektrum lengkap kekuatan matematika!" },
      { score: 80, message: "🔮 Magis! Otakmu sekarang dapat memprediksi masa depan numerik!" },
      { score: 90, message: "🌌 Fenomenal! Kamu menciptakan supernova matematika!" },
      { score: 100, message: "👑 LEGENDA! Kamu resmi menjadi penguasa tertinggi matematika futuristik!" },
    ];
    
    // Find specific milestone message or generate one
    const milestone = messages.find(m => m.score === score);
    if (milestone) return milestone.message;
    
    // For scores above 100 or not in the list
    return `🏆 Level ${score/10} Tercapai! Kemampuan matematikamu melebihi batas pemahaman manusia!`;
  };

  const showMilestoneReached = (score: number) => {
    const message = getMilestoneMessage(score);
    setMilestoneMessage(message);
    setShowMilestone(true);
    
    // Auto-hide milestone after 4 seconds
    setTimeout(() => {
      setShowMilestone(false);
    }, 4000);
  };

  const calculateCorrectAnswer = (): number => {
    switch (operation) {
      case "+": return num1 + num2;
      case "-": return num1 - num2;
      case "×": return num1 * num2;
      default: return 0;
    }
  };

  const checkAnswer = () => {
    const userAnswer = parseInt(answer);
    const correctAnswer = calculateCorrectAnswer();
    
    if (!isNaN(userAnswer) && userAnswer === correctAnswer) {
      setMessage("✅ Jawaban benar!");
      setScore(score + 1);
      playSound(true);
      generateQuestion();
    } else {
      setMessage(`❌ Jawaban salah! Jawaban yang benar: ${correctAnswer}`);
      setHealth(health - 1);
      playSound(false);
      if (health - 1 === 0) {
        setMessage("💀 Game Over! Skor direset.");
        setScore(0);
        setHealth(3);
        setLastMilestoneScore(0);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  };

  return (
    <div className="container futuristic">
      <h1 className="title">🧠 Matematika Futuristik 🚀</h1>
      <div className="controls">
        <div className="control-group">
          <label>Pilih Level:</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="mudah">Mudah (Satuan)</option>
            <option value="menengah">Menengah (Puluhan)</option>
            <option value="sulit">Sulit (Ratusan)</option>
          </select>
        </div>
        <div className="control-group">
          <label>Operasi:</label>
          <div className="operation-buttons">
            <button 
              className={`operation-btn ${operation === "+" ? "active" : ""}`} 
              onClick={() => setOperation("+")}
            >
              +
            </button>
            <button 
              className={`operation-btn ${operation === "-" ? "active" : ""}`} 
              onClick={() => setOperation("-")}
            >
              -
            </button>
            <button 
              className={`operation-btn ${operation === "×" ? "active" : ""}`} 
              onClick={() => setOperation("×")}
            >
              ×
            </button>
          </div>
        </div>
      </div>
      <div className="status-bar">
        <span className="score">⭐ Skor: {score}</span>
        <div className="health-bar">
          <div className="health" style={{ width: `${(health / 3) * 100}%` }}></div>
        </div>
      </div>
      <h2 className="question">{num1} {operation} {num2} = ?</h2>
      <input 
        type="number" 
        value={answer} 
        onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ''))}
        className="input futuristic-input"
        onKeyDown={handleKeyPress}
        autoFocus
      />
      <button onClick={checkAnswer} className="button futuristic-button">Cek Jawaban</button>
      <p className="message futuristic-message">{message}</p>
      
      {/* Milestone celebration overlay */}
      {showMilestone && (
        <div className="milestone-overlay">
          <div className="milestone-popup">
            <div className="milestone-content">
              <h3>🏆 MILESTONE TERCAPAI! 🏆</h3>
              <p>{milestoneMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);

export default App;