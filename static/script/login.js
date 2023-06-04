document.addEventListener('DOMContentLoaded', () => {

    const activateErrorInputText = (input, inputsTextErrorClass, hiddenClass) => {
      input.classList.add(inputsTextErrorClass);
      input.nextElementSibling.classList.remove(hiddenClass);
    };

    const inputsTextErrorClass = 'admin-form__input-text_error',
    hiddenClass = 'hidden';

    const deactivateErrorInputText = (input, inputsTextErrorClass, hiddenClass) => {
        input.classList.remove(inputsTextErrorClass);
        input.nextElementSibling.classList.add(hiddenClass);
    };


    const formLogin = document.querySelector('#formLogin'),
        loginEmail = formLogin.querySelector('#loginEmail'),
        loginPassword = formLogin.querySelector('#loginPassword'),
        adminFormInfo =  formLogin.querySelector('.admin-form__info');
    
    const validateEmail =   (input, inputsTextErrorClass, hiddenClass) => {
        const validateEmailCorrectType = (email) => {
            let pattern  = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return pattern.test(email);
        };
        if(validateEmailCorrectType(input.value)) {
            deactivateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            return true;
        } else {
            activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            return false;
        }
    };

    formLogin.addEventListener('submit', (event) => {
      event.preventDefault();
        const formData = Object.fromEntries(new FormData(formLogin));
        function showError(error) {
            adminFormInfo.classList.remove('admin-form__success');
            adminFormInfo.classList.add('admin-form__error');
            adminFormInfo.innerHTML = error;
        }
        function showSuccess(message) {
            adminFormInfo.classList.remove('admin-form__error');
            adminFormInfo.classList.add('admin-form__success');
            adminFormInfo.innerHTML = message;            }
        if (validateEmail(loginEmail, inputsTextErrorClass, hiddenClass)){
            showSuccess();

            const login = fetch("/api/auth", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(formData)
            });


            login.then((response) => {
                response.text().then(function (data) {
                    let result = data;
                    if(result) {
                        showError(result);
                        console.error('Ошибка!');
                    } else {
                        showSuccess('ok!');
                        window.location.replace('http://localhost:3000/admin');
                    }
                });
            }).catch((error) => {
                showError(error);
                console.error('Ошибка!');
            });
        } else {
            showError('Email or password incorrect.');
        }
    });

    const passwordEye = document.querySelector('.admin-form__input-text_password-eye');

    passwordEye.addEventListener('click', (event) => {
        if (loginPassword.getAttribute('type') ===  'password'){
            loginPassword.setAttribute('type', 'text');
        } else {
            loginPassword.setAttribute('type', 'password');
        }
    });



});