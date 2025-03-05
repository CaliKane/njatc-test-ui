document.addEventListener("DOMContentLoaded", () => {
    const testArea = document.getElementById("test-area");
    const submitBtn = document.getElementById("submit-btn");
    const resultDiv = document.getElementById("result");
    const timerDiv = document.getElementById("timer");
    const progressFill = document.getElementById("progress-fill");
    let score = 0;
    let attempts = {};
    let timeLeft = 32 * 60; // 32 minutes in seconds (15 min math + 17 min reading)
    let timer;

    // Start timer
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDiv.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                alert("Time's up! Submit your answers.");
                submitBtn.click();
            }
        }, 1000);
    }

    // Load test data
    fetch("tests/test1.json")
        .then(response => response.json())
        .then(data => {
            renderTest(data);
            startTimer();
        });

    function renderTest(questions) {
        questions.forEach((q, index) => {
            const div = document.createElement("div");
            div.className = "question";
            div.innerHTML = `
                <p>${q.passage ? q.passage + "<br>" : ""}${q.question}</p>
                ${q.options.map((opt, i) => `
                    <label>
                        <input type="radio" name="q${index}" value="${opt}"> ${opt}
                    </label><br>
                `).join("")}
                <span class="hint">${q.hint}</span>
                <div id="tip${index}" class="tip"></div>
                <div id="explanation${index}" class="tip" style="display: none;"></div>
            `;
            testArea.appendChild(div);
            attempts[index] = 0;
            updateProgress((index + 1) / questions.length * 100);
        });
    }

    function updateProgress(percentage) {
        progressFill.style.width = `${percentage}%`;
    }

    submitBtn.addEventListener("click", () => {
        score = 0;
        fetch("tests/test1.json")
            .then(response => response.json())
            .then(questions => {
                let allAnswered = true;
                questions.forEach((q, index) => {
                    const selected = document.querySelector(`input[name="q${index}"]:checked`);
                    if (!selected) {
                        allAnswered = false;
                        return;
                    }

                    if (selected.value === q.answer) {
                        score++;
                        playSound("correct.mp3");
                        document.getElementById(`tip${index}`).style.display = "none";
                        document.getElementById(`explanation${index}`).style.display = "none";
                    } else {
                        attempts[index]++;
                        if (attempts[index] < 3) {
                            playSound("incorrect.mp3");
                            document.getElementById(`tip${index}`).innerText = q.tip;
                            document.getElementById(`tip${index}`).style.display = "block";
                            alert("Try again! You have " + (3 - attempts[index]) + " attempts left.");
                            return; // Stop grading until corrected
                        } else {
                            playSound("incorrect.mp3");
                            document.getElementById(`tip${index}`).style.display = "none";
                            document.getElementById(`explanation${index}`).innerText = `Correct Answer: ${q.answer}. Explanation: ${q.explanation || "See hint for guidance."}`;
                            document.getElementById(`explanation${index}`).style.display = "block";
                        }
                    }
                });

                if (allAnswered) {
                    clearInterval(timer);
                    const percentage = (score / questions.length) * 100;
                    resultDiv.innerHTML = `Score: ${percentage}%`;
                    if (percentage >= 80) playSound("pass.mp3");
                } else {
                    alert("Please answer all questions before submitting!");
                }
            });
    });

    function playSound(file) {
        const audio = new Audio(`sounds/${file}`);
        audio.play();
    }
});