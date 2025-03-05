document.addEventListener("DOMContentLoaded", () => {
    const testArea = document.getElementById("test-area");
    const submitBtn = document.getElementById("submit-btn");
    const resultDiv = document.getElementById("result");
    let score = 0;
    let attempts = {};

    // Load test data
    fetch("tests/test1.json")
        .then(response => response.json())
        .then(data => renderTest(data));

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
                <div id="answer${index}" class="answer" style="display: none;">Correct Answer: ${q.answer}<br>Explanation: ${q.explanation || "See hint for steps."}</div>
            `;
            testArea.appendChild(div);
            attempts[index] = 0;
        });
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
                        alert("Please answer all questions before submitting!");
                        return;
                    }

                    if (selected.value === q.answer) {
                        score++;
                        playSound("correct.mp3");
                        document.getElementById(`tip${index}`).style.display = "none";
                        document.getElementById(`answer${index}`).style.display = "none";
                    } else {
                        attempts[index]++;
                        if (attempts[index] < 3) {
                            playSound("incorrect.mp3");
                            document.getElementById(`tip${index}`).innerText = q.tip;
                            document.getElementById(`tip${index}`).style.display = "block";
                            alert("Try again! You have " + (3 - attempts[index]) + " attempts left.");
                            score--; // Prevent partial scoring on retries
                            return; // Stop further processing for this submission
                        } else {
                            playSound("incorrect.mp3");
                            document.getElementById(`tip${index}`).style.display = "none";
                            document.getElementById(`answer${index}`).style.display = "block";
                            alert("Attempts exhausted. Correct answer and explanation revealed.");
                        }
                    }
                });
                if (allAnswered) {
                    const percentage = (score / questions.length) * 100;
                    resultDiv.innerHTML = `Score: ${percentage}%`;
                    if (percentage >= 80) playSound("pass.mp3");
                }
            });
    });

    function playSound(file) {
        const audio = new Audio(`sounds/${file}`);
        audio.play();
    }
});