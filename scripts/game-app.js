(function(){
    const TIMER_PERIOD_SECS = 120;
    let timerInterval;
    let openCardsCount = 0;
    let cardValueArray;
    let gameFieldSide;
    let isGameActive = 0;

    function createStartGameTitle(title) {
        let startGameTitle = document.createElement('h2');
        startGameTitle.innerHTML = title;
        return startGameTitle;
    }

    function createStartGameForm() {
        let form = document.createElement('form');
        let formDescription = document.createElement('p');
        let inputGameFieldSide = document.createElement('input');
        let buttonStartGame = document.createElement('button');

        inputGameFieldSide.type = 'number';
        inputGameFieldSide.value = 4;
        inputGameFieldSide.min = 2;
        inputGameFieldSide.max = 10;
        inputGameFieldSide.step = 2;
        formDescription.classList.add('start-game-description');
        formDescription.innerHTML = 'Введите размер сторон игрового поля. Можно ввести только четное значение от 2 до 10. При введении значений, не удовлетворяющих условиям, будет запущена игра на поле размером 4x4.';
        buttonStartGame.textContent = 'Начать игру!';

        form.append(formDescription);
        form.append(inputGameFieldSide);
        form.append(buttonStartGame);

        return {
            form,
            inputGameFieldSide,
            buttonStartGame,
        }
    }

    function createGameField() {
        
        let mainContainersArray = Array.from(document.getElementsByTagName('main'));
        if (mainContainersArray.length) mainContainersArray.forEach(x => x.remove());
        

        let field = document.createElement('main');
        let buttonRestartGame = document.createElement('button');
        let timer = createTimer();

        cardValueArray = shuffleCards();

        buttonRestartGame.textContent = 'Сыграть ещё раз!';
        
        field.classList.add('card-field');
        field.append(timer.timerDiv);
        field.append(buttonRestartGame);     
        createGameCards(field, buttonRestartGame);

        return {
            field, 
            cardValueArray,
            buttonRestartGame,
            timer,
        };
    }

    function clickOnCard() {
        if (!!this.textContent || isGameActive === 0) return;
        const cardsCount = gameFieldSide * gameFieldSide;
        
        let matchedCardsArray = Array.from(document.getElementsByClassName('matched-card'));
        let openedCardsArray = Array.from(document.getElementsByClassName('opened-card'));
        if (openCardsCount === 2) {
            if (openedCardsArray[0].textContent === openedCardsArray[1].textContent) {
                openedCardsArray.forEach(x => {
                    x.classList.remove('opened-card');
                    x.classList.add('matched-card');
                    x.removeEventListener('click', clickOnCard);
                })
            } else {
                openedCardsArray.forEach(x => {
                    x.classList.remove('opened-card');
                    x.textContent = '';
                })
            }
            openCardsCount = 0;
        }
        
        !this.textContent ? this.textContent = cardValueArray[Number(this.id)] : this.textContent = '';

        if (cardsCount - matchedCardsArray.length === 2 && openCardsCount === 1) {
            this.classList.add('matched-card');
            openedCardsArray[0].classList.remove('opened-card');
            openedCardsArray[0].classList.add('matched-card');
            openCardsCount = 0;
            stopGame(true);
            return;
        }

        this.classList.add('opened-card');
        
        openCardsCount++;
    }

    function createGameCards(field, buttonRestartGame) {
        for (let i = 0; i < gameFieldSide; i++) {
            let cardRow = document.createElement('div');
            cardRow.classList.add('card-row');
            for (let j = 0; j < gameFieldSide; j++) {
                let card = document.createElement('div');
                card.classList.add('card');
                card.id = i * gameFieldSide + j;
                
                card.addEventListener('click', clickOnCard.bind(card));

                cardRow.append(card);
            };
            field.insertBefore(cardRow, buttonRestartGame);
        }
    }

    function deleteGameCards() {
        let gameCardsArray = Array.from(document.getElementsByClassName('card'));
        gameCardsArray.forEach(x => x.remove());
    }

    function shuffleCards() {
        const cardsCount = gameFieldSide * gameFieldSide;
        let cardArray = []

        for(let i = 0; i < cardsCount; i++) cardArray.push(Math.ceil((i + 1) / 2));

        for(let i = cardArray.length - 1; i > 0; i--) {
            let randomIndex = Math.floor(i * Math.random());
            let tmp = cardArray[i];
            cardArray[i] = cardArray[randomIndex];
            cardArray[randomIndex] = tmp;
        }
        return cardArray;
    }

    function createTimer() {
        let timerDiv = document.createElement('div');
        let timerTitle = document.createElement('h3');
        let timerText = document.createElement('div');

        timerDiv.classList.add('timer-block');
        timerTitle.textContent = 'Таймер';
        timerTitle.classList.add('timer-block-title');
        timerText.classList.add('timer-block-text');

        timerDiv.append(timerTitle);
        timerDiv.append(timerText);

        return {
            timerDiv,
            timerText,
        };
    }

    function startGame(gameField) {
        let startValueTimer = TIMER_PERIOD_SECS;
        gameField.timer.timerText.textContent = startValueTimer;
        isGameActive = 1;

        timerInterval = setInterval(() => {
            startValueTimer--;
            gameField.timer.timerText.textContent = startValueTimer;
            if (startValueTimer === 0) stopGame(false);
        }, 1000);
    }

    function stopGame(result) {
        isGameActive = 0;
        clearInterval(timerInterval);
        result ? setTimeout(() => { alert('Ура! У тебя получилось! Сыграем еще раз?') }, 100) : setTimeout(() => { alert('Вы не успели закончить игру! Попробуйте еще раз!') }, 100);
    }

    // создаем страницу приложения
    function createApp(container) {
        let startGameTitle = createStartGameTitle('Игра в пары');
        let startGameForm = createStartGameForm();

        container.append(startGameTitle);
        container.append(startGameForm.form);

        startGameForm.form.addEventListener('submit', function(e) {
            // эта строчка необходима, чтобы предотвратить стандартное действие браузера
            // в данному случае мы не хотим, чтобы страница перезагружалась при отправке формы
            e.preventDefault();
            
            isGameActive = 0;
            openCardsCount = 0;
            clearInterval(timerInterval);

            gameFieldSide = startGameForm.inputGameFieldSide.value;
            let gameField = createGameField();

            container.append(gameField.field);
            startGame(gameField);

            gameField.buttonRestartGame.addEventListener('click', function(e) {
                isGameActive = 0;
                openCardsCount = 0;
                clearInterval(timerInterval);
                
                deleteGameCards();
                createGameCards(gameField.field, gameField.buttonRestartGame);
                
                startGame(gameField);
            });
        });
    }

    window.createApp = createApp;
})();