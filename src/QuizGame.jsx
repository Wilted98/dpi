import { useState, useEffect } from "react";
import questionsData from "./questionData.json";  // Import the local JSON

// A simple array shuffle function
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

function QuizGame() {
  // We already have our JSON data imported as `questionsData`
  const [rawQuestions] = useState(questionsData); // store the JSON in state (read-only)
  const [questions, setQuestions] = useState([]); // final set of questions (after randomization or not)
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);   // current selected answer key (e.g. 'A', 'B', 'C', ...)
  const [timeLimit, setTimeLimit] = useState(5);        // 5, 10, or 15 minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isRandom, setIsRandom] = useState(false);      // toggle for randomizing questions

  // --- Step: Start Quiz with chosen settings ---
  const startQuiz = () => {
    if (!rawQuestions || rawQuestions.length === 0) {
      alert("No questions found in the JSON!");
      return;
    }
    // Shuffle if isRandom is true, otherwise use the original order
    const orderedQuestions = isRandom ? shuffleArray(rawQuestions) : [...rawQuestions];
    setQuestions(orderedQuestions);
    setQuestionIndex(0);
    setUserAnswer(null);
    setTimeLeft(timeLimit * 60); // convert minutes to seconds
    setQuizStarted(true);
  };

  // --- Timer Effect ---
  useEffect(() => {
    let timerId;
    if (quizStarted && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerId);
            // Time is up -> end quiz or handle differently
            setQuizStarted(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [quizStarted, timeLeft]);

  // --- If there are no questions but the quiz is started, show a message ---
  if (quizStarted && questions.length === 0) {
    return <div>No questions available.</div>;
  }

  // --- Retrieve current question info ---
  const currentQuestion = questions[questionIndex] || {};
  const correctAnswer = currentQuestion.correct_answer;

  // --- Handle user's answer selection ---
  const handleAnswerSelection = (optionKey) => {
    if (userAnswer) return; // prevent changing answer after one is chosen
    setUserAnswer(optionKey);
  };

  // --- Move to next question or finish quiz ---
  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setUserAnswer(null);
    } else {
      // Last question answered -> end quiz
      setQuizStarted(false);
    }
  };

  // --- Style for answer highlighting ---
  const getOptionStyle = (optionKey) => {
    if (!userAnswer) {
      return {};
    }
    if (optionKey === correctAnswer) {
      // Correct answer = green
      return { backgroundColor: "lightgreen" };
    }
    if (optionKey === userAnswer && userAnswer !== correctAnswer) {
      // User's wrong answer = red
      return { backgroundColor: "salmon" };
    }
    return {};
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
      <h1>React Quiz Game</h1>

      {/* Show settings if quiz not started yet */}
      {!quizStarted && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ marginRight: "1rem" }}>
            <strong>Time Limit:</strong>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              style={{ marginLeft: "0.5rem" }}
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </label>

          <label>
            <input
              type="checkbox"
              checked={isRandom}
              onChange={(e) => setIsRandom(e.target.checked)}
            />
            Randomize Questions
          </label>

          <div style={{ marginTop: "1rem" }}>
            <button onClick={startQuiz}>Start Quiz</button>
          </div>
        </div>
      )}

      {/* Quiz area */}
      {quizStarted && questions.length > 0 && (
        <div>
          {/* Timer */}
          <div style={{ marginBottom: "0.5rem" }}>
            <strong>Time Left: </strong>
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>

          {/* Question */}
          <h2>Question {questionIndex + 1} of {questions.length}</h2>
          <p>{currentQuestion.question_text}</p>

          {/* Options */}
          {currentQuestion.options &&
            Object.entries(currentQuestion.options).map(([key, text]) => (
              <div
                key={key}
                style={{
                  margin: "0.25rem 0",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  cursor: userAnswer ? "default" : "pointer",
                  ...getOptionStyle(key),
                }}
                onClick={() => handleAnswerSelection(key)}
              >
                <strong>{key}.</strong> {text}
              </div>
            ))}

          {/* Next / Finish Button */}
          {userAnswer && (
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleNextQuestion}>
                {questionIndex < questions.length - 1 ? "Next" : "Finish"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* End of Quiz / Results */}
      {!quizStarted && questionIndex >= questions.length && questions.length > 0 && (
        <div>
          <h2>Quiz Finished!</h2>
          {/* You can add a results summary or score here */}
          <button onClick={() => window.location.reload()}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizGame;
