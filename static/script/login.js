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
    
    const validatePassword = (input, password, inputsTextErrorClass, hiddenClass) => {
        if(input.value == password) {
            deactivateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            return true;
        } else {
            activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            return false;
        }
    };

    const validateEmail =   (input, inputsTextErrorClass, hiddenClass) => {
        const validateEmailCorrectType = (email) => {
            let pattern  = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
            return pattern.test(email);
        };
        if(validateEmailCorrectType(input.value)) {
            if (input.value == 'reghansan@gmail.com') {
                deactivateErrorInputText(input, inputsTextErrorClass, hiddenClass);
                return true;
            } else {
                activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
                return false;
            }
        } else {
            activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            return false;
        }
    };

    formLogin.addEventListener('submit', (event) => {
      event.preventDefault();
        function showError(error) {
            adminFormInfo.classList.remove('admin-form__success');
            adminFormInfo.classList.add('admin-form__error');
            adminFormInfo.innerHTML = error;
        }
        function showSuccess() {
            adminFormInfo.classList.remove('admin-form__error');
            adminFormInfo.classList.add('admin-form__success');
            adminFormInfo.innerHTML = 'ok!';            }
        if (validateEmail(loginEmail, inputsTextErrorClass, hiddenClass) & validatePassword(loginPassword, '123',inputsTextErrorClass, hiddenClass)){
            showSuccess();
        } else {
            showError('Email or password incorrect.');
        }
    });




})