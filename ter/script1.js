document.addEventListener('DOMContentLoaded', function () {
    // --- Переменные для работы со страницами ---
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsPanel = document.querySelector('.settings-panel');
    const themeSelector = document.getElementById('theme-selector');
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeDisplay = document.getElementById('font-size-display');
    const closeSettingsBtn = document.querySelector('.close-settings-btn');
    const addHabitBtn = document.querySelector('.add-habit-btn');
    const addHabitModal = document.querySelector('.add-habit-modal');
    const closeAddHabitModalBtn = document.querySelector('.close-add-habit-modal-btn');
    const habitNameInput = document.getElementById('habit-name');
    const habitFrequencyInput = document.getElementById('habit-frequency');
    const saveHabitBtn = document.querySelector('.save-habit-btn');
    const editHabitModal = document.querySelector('.edit-habit-modal');
    const closeEditHabitModalBtn = document.querySelector('.close-edit-habit-modal-btn');
    const editHabitNameInput = document.getElementById('editHabitName');
    const editHabitFrequencyInput = document.getElementById('editHabitFrequency');
    const saveEditHabitBtn = document.querySelector('.save-edit-habit-btn');

    // --- Переменные для календаря и списка привычек ---
    const calendarTableBody = document.querySelector('.calendar tbody');
    const monthYearDisplay = document.getElementById('month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const habitsList = document.querySelector('.habits-list');
    const taskCountDisplay = document.getElementById('task-count');
    let currentDate = new Date();
    let currentTheme = localStorage.getItem('theme') || 'light';
    let currentFontSize = localStorage.getItem('fontSize') || 16;
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let selectedDay = null;
    let habitToEdit = null;

    // --- Переменные для модальных окон ---
    const infoModal = document.getElementById('infoModal');
    const editModal = document.getElementById('editModal');
    const closeInfoHabitModalBtn = document.querySelector('.close-info-habit-modal-btn');
    const editHabitBtn = document.querySelector('.edit-habit-btn');
    const closeEditModalBtn = document.querySelector('.close-edit-habit-modal-btn');
    let currentHabit = null;

    // --- Функция установки темы ---
    function setTheme(theme) {
        body.classList.remove('light-theme', 'dark-theme', 'red-theme', 'blue-theme');
        body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    // --- Функция установки размера текста ---
    function setFontSize(size) {
        body.style.fontSize = `${size}px`;
        fontSizeDisplay.textContent = size;
        localStorage.setItem('fontSize', size);
        currentFontSize = size;
    }

    // --- Инициализация темы и размера текста ---
    setTheme(currentTheme);
    setFontSize(currentFontSize);
    fontSizeDisplay.textContent = currentFontSize;
    fontSizeSlider.value = currentFontSize;

    // --- Инициализация элементов управления ---
    themeSelector.value = currentTheme;
    themeSelector.addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    fontSizeSlider.addEventListener('input', (e) => {
        setFontSize(e.target.value);
    });

    // --- Управление открытием/закрытием панели настроек ---
    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('open');
        settingsPanel.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('hidden');
        settingsPanel.classList.remove('open');
    });

    // --- Управление открытием/закрытием модального окна добавления привычки ---
    addHabitBtn.addEventListener('click', () => {
        addHabitModal.classList.toggle('hidden');
    });
    closeAddHabitModalBtn.addEventListener('click', () => {
        addHabitModal.classList.add('hidden');
    });

    // --- Сохранение новой привычки ---
    saveHabitBtn.addEventListener('click', () => {
        const habitName = habitNameInput.value;
        const habitFrequency = habitFrequencyInput.value;

        if (habitName && habitFrequency) {
            const newHabit = {
                name: habitName,
                frequency: parseInt(habitFrequency, 10),
                days: Array(7).fill(false),
                streak: 0,
                lastCompletionDate: null,
            };
            habits.push(newHabit);
            localStorage.setItem('habits', JSON.stringify(habits));
            habitNameInput.value = '';
            habitFrequencyInput.value = '';
            addHabitModal.classList.add('hidden');
            renderCalendar();
            renderHabits();
        } else {
            alert('Заполните все поля');
        }
    });

    // --- Управление открытием/закрытием модального окна редактирования привычки ---
    closeEditHabitModalBtn.addEventListener('click', () => {
        editHabitModal.classList.add('hidden');
    });

    // --- Сохранение отредактированной привычки ---
    saveEditHabitBtn.addEventListener('click', () => {
        if (habitToEdit) {
            const editedName = editHabitNameInput.value;
            const editedFrequency = editHabitFrequencyInput.value;
            if (editedName && editedFrequency) {
                habitToEdit.name = editedName;
                habitToEdit.frequency = parseInt(editedFrequency, 10);
                localStorage.setItem('habits', JSON.stringify(habits));
                editHabitModal.classList.add('hidden');
                renderHabits();
                habitToEdit = null;
                editHabitNameInput.value = '';
                editHabitFrequencyInput.value = '';
            } else {
                alert('Заполните все поля');
            }
        }
    });

    // --- Функция для генерации календаря ---
    function renderCalendar() {
        calendarTableBody.innerHTML = '';

        const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const daysInMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
        ).getDate();
        const weekdayOfFirstDay = firstDayOfMonth.getDay();
        const monthNames = [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь',
        ];
        monthYearDisplay.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

        let dayCounter = 1;
        for (let i = 0; i < 6; i++) {
            const weekRow = document.createElement('tr');
            for (let j = 0; j < 7; j++) {
                if (
                    (i === 0 && j < weekdayOfFirstDay - (weekdayOfFirstDay === 0 ? -6 : 1)) ||
                    dayCounter > daysInMonth
                ) {
                    const emptyCell = document.createElement('td');
                    weekRow.appendChild(emptyCell);
                } else {
                    const dayCell = document.createElement('td');
                    dayCell.textContent = dayCounter;
                    dayCell.dataset.day = dayCounter;
                    dayCell.dataset.month = currentDate.getMonth();
                    dayCell.dataset.year = currentDate.getFullYear();
                    dayCell.addEventListener('click', selectDay);
                    if (
                        currentDate.getFullYear() === new Date().getFullYear() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        dayCounter === new Date().getDate()
                    ) {
                        dayCell.classList.add('selected');
                        selectedDay = dayCell;
                        renderHabits();
                    }
                    if (
                        selectedDay &&
                        selectedDay.dataset.day == dayCounter &&
                        selectedDay.dataset.month == currentDate.getMonth() &&
                        selectedDay.dataset.year == currentDate.getFullYear()
                    ) {
                        dayCell.classList.add('selected');
                    }
                    weekRow.appendChild(dayCell);
                    dayCounter++;
                }
            }
            calendarTableBody.appendChild(weekRow);
        }
    }

    // --- Функция выбора дня в календаре ---
    function selectDay(e) {
        const day = e.target;
        if (selectedDay) {
            selectedDay.classList.remove('selected');
        }
        day.classList.add('selected');
        selectedDay = day;
        renderHabits();
    }

    // --- Функции перехода между месяцами ---
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        renderHabits();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        renderHabits();
    });

    // --- Функция для отображения привычек в выбранный день ---
    function renderHabits() {
        habitsList.innerHTML = '';
        if (selectedDay) {
            const dayNumber = parseInt(selectedDay.dataset.day, 10);
            const monthNumber = parseInt(selectedDay.dataset.month, 10);
            const yearNumber = parseInt(selectedDay.dataset.year, 10);
            const selectedDate = new Date(yearNumber, monthNumber, dayNumber);
            const selectedWeekday = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;

            habits.forEach((habit) => {
                const habitItem = document.createElement('li');
                const isCompleted = habit.days[selectedWeekday] === true;

                habitItem.innerHTML = `
                    <button data-habit-index="${habits.indexOf(habit)}" class="complete-btn">
                        <i class="fas ${isCompleted ? 'fa-check-square' : 'fa-square'}"></i>
                    </button>
                    <span>${habit.name}</span>
                    <span>Выполнено подряд: ${calculateStreak(habit, selectedDate)}</span>
                `;

                if (isCompleted) {
                    habitItem.classList.add('completed');
                }
                habitsList.appendChild(habitItem);
            });

            taskCountDisplay.textContent = calculateCompletedTasks();
        } else {
            taskCountDisplay.textContent = calculateCompletedTasks();
        }

        // Обработка нажатия на кнопку выполненности привычки
        document.querySelectorAll('.habits-list .complete-btn').forEach((button) => {
            button.addEventListener('click', (e) => {
                const habitIndex = e.target.closest('button').dataset.habitIndex;
                const dayNumber = parseInt(selectedDay.dataset.day, 10);
                const monthNumber = parseInt(selectedDay.dataset.month, 10);
                const yearNumber = parseInt(selectedDay.dataset.year, 10);
                const selectedDate = new Date(yearNumber, monthNumber, dayNumber);
                const selectedWeekday = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;

                if (habits[habitIndex]) {
                    habits[habitIndex].days[selectedWeekday] = !habits[habitIndex].days[selectedWeekday];
                    localStorage.setItem('habits', JSON.stringify(habits));
                    renderHabits();
                    renderCalendar();
                }
            });
        });

        // Обработка двойного нажатия на привычку
        document.querySelectorAll('.habits-list li').forEach(habitItem => {
            habitItem.addEventListener('dblclick', () => {
                const habitIndex = habitItem.querySelector('button').dataset.habitIndex;
                openInfoModal(habits[habitIndex]);
            });
        });
    }

    // --- Функция для открытия модального окна с информацией о привычке ---
    function openInfoModal(habit) {
        currentHabit = habit;
        document.getElementById('infoHabitName').innerText = habit.name;
        document.getElementById('infoStreak').innerText = habit.streak;
        document.getElementById('infoDays').innerText = habit.days.map((day, index) => day ? ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index] : null).filter(day => day).join(', ');
        infoModal.classList.remove('hidden');
    }

    // --- Функция для закрытия модального окна с информацией о привычке ---
    closeInfoHabitModalBtn.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    // --- Функция для открытия модального окна редактирования привычки ---
    editHabitBtn.addEventListener('click', () => {
        infoModal.classList.add('hidden');
        document.getElementById('editHabitName').value = currentHabit.name;
        document.getElementById('editHabitFrequency').value = currentHabit.frequency;
        editModal.classList.remove('hidden');
    });

    // --- Функция для закрытия модального окна редактирования ---
    closeEditModalBtn.addEventListener('click', () => {
        editModal.classList.add('hidden');
    });

    // --- Функция для подсчета количества выполненных задач ---
    function calculateCompletedTasks() {
        let count = 0;
        if (selectedDay) {
            const dayNumber = parseInt(selectedDay.dataset.day, 10);
            const monthNumber = parseInt(selectedDay.dataset.month, 10);
            const yearNumber = parseInt(selectedDay.dataset.year, 10);
            const selectedDate = new Date(yearNumber, monthNumber, dayNumber);
            const selectedWeekday = selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1;
            habits.forEach((habit) => {
                if (habit.days[selectedWeekday] === true) {
                    count++;
                }
            });
        } else {
            habits.forEach((habit) => {
                habit.days.forEach((day) => {
                    if (day === true) {
                        count++;
                    }
                });
            });
        }
        return count;
    }

    // --- Функция для подсчета дней выполнения подряд ---
    function calculateStreak(habit, selectedDate) {
        let streak = 0;
        let currentDateCopy = new Date(selectedDate);
        const selectedWeekday = currentDateCopy.getDay() === 0 ? 6 : currentDateCopy.getDay() - 1;
        if (habit.days[selectedWeekday] === true) {
            streak = 1;
            currentDateCopy.setDate(currentDateCopy.getDate() - 1);
            while (true) {
                const currentWeekday = currentDateCopy.getDay() === 0 ? 6 : currentDateCopy.getDay() - 1;
                const habitLastDate = new Date(currentDateCopy);
                if (
                    habitLastDate.getFullYear() >= new Date().getFullYear() &&
                    habitLastDate.getMonth() >= new Date().getMonth() &&
                    habitLastDate.getDate() >= new Date().getDate() - 365
                ) {
                    if (habit.days[currentWeekday] === true) {
                        streak++;
                        currentDateCopy.setDate(currentDateCopy.getDate() - 1);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        return streak;
    }

    // Инициализация календаря и списка привычек при загрузке страницы
    renderCalendar();
    renderHabits();
});
