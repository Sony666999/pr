document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const loginForm = document.getElementById('loginForm');

    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Логика регистрации
            alert('Регистрация успешна!');
            window.location.href = 'index1.html';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Логика входа
            alert('Вход успешен!');
            window.location.href = 'index1.html';
        });
    }
});
