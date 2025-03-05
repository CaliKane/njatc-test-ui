// Ensure script runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const questionDiv = document.getElementById('question');
    const optionsDiv = document.getElementById('options');
    const hintDiv = document.getElementById('hint');
    const resultDiv = document.getElementById('result');
    const nextButton = document.getElementById('next');
    const soundToggle = document.getElementById('soundToggle');

    // Check for null elements and log errors
    if (!questionDiv || !optionsDiv || !hintDiv || !resultDiv || !nextButton || !soundToggle) {
        console.error('One or more DOM elements not found. Check index.html IDs.');
        return;
    }

    let currentTest = 'test1.json';
    let questions = [];
    let currentQuestion = 0;
    let attempts = 0;
    let lastHintTime = 0;
    let soundEnabled = false;
    let answered = false;

    async function loadTest(file) {
        try {
            const response = await fetch(`tests/${file}`);
            questions = await response.json();
            displayQuestion();
        } catch (e) {
            console.error('Error loading test:', e);
            resultDiv.textContent = 'Error loading test. Please check console.';
        }
    }

    function displayQuestion() {
        if (currentQuestion >= questions.length) {
            questionDiv.textContent = 'Test Completed!';
            optionsDiv.innerHTML = '';
            hintDiv.classList.add('hint-hidden');
            resultDiv.textContent = '';
            nextButton.style.display = 'none';
            return;
        }

        const q = questions[currentQuestion];
        questionDiv.textContent = `${q.question} (${q.directions})`;
        optionsDiv.innerHTML = q.options.map((opt, i) => 
            `<button class="option" data-index="${i}">${opt}</button>`).join('');
        hintDiv.textContent = 'Hover for hint (after 30s or 1 wrong attempt)';
        hintDiv.classList.add('hint-hidden');
        resultDiv.textContent = '';
        attempts = 0;
        answered = false;
        document.querySelectorAll('.option').forEach(button => {
            button.addEventListener('click', (e) => {
                handleAnswer(e);
                answered = true;
                nextButton.disabled = false;
            });
        });
        nextButton.disabled = true;
    }

    function handleAnswer(event) {
        const selected = event.target.dataset.index;
        const q = questions[currentQuestion];
        attempts++;

        if (!q.options[selected]) {
            console.error('Invalid option selected');
            return;
        }

        if (q.options[selected] === q.answer) {
            resultDiv.textContent = 'Correct! ' + q.explanation;
            if (soundEnabled) playSound('correct');
            setTimeout(() => {
                currentQuestion++;
                displayQuestion();
            }, 1000);
        } else if (attempts < 3) {
            resultDiv.textContent = 'Incorrect. Try again. Attempts left: ' + (3 - attempts);
            if (soundEnabled) playSound('incorrect');
            if (attempts === 1) showHint();
        } else {
            resultDiv.textContent = `Incorrect. The answer is ${q.answer}. ${q.explanation}`;
            if (soundEnabled) playSound('incorrect');
            setTimeout(() => {
                currentQuestion++;
                displayQuestion();
            }, 1000);
        }
    }

    function showHint() {
        const now = Date.now();
        if (now - lastHintTime < 30000 && attempts < 2) return;
        
        const q = questions[currentQuestion];
        hintDiv.textContent = attempts === 1 ? q.hint : q.second_hint;
        hintDiv.classList.remove('hint-hidden');
        lastHintTime = now;
    }

    hintDiv.addEventListener('mouseover', showHint);
    hintDiv.addEventListener('mouseout', () => hintDiv.classList.add('hint-hidden'));

    nextButton.addEventListener('click', () => {
        if (!answered) {
            resultDiv.textContent = 'Please answer the question before submitting!';
            return;
        }
        currentQuestion++;
        displayQuestion();
    });

    soundToggle.addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
    });

    function playSound(type) {
        const audio = new Audio(`sounds/${type}.mp3`);
        audio.play().catch(e => console.error('Sound error:', e));
    }

    loadTest(currentTest);
});