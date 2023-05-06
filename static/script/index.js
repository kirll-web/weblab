'use strict';

document.addEventListener('DOMContentLoaded', () => {
    
    const postForm = document.querySelector('#admin-form');

    const validateForm = () => {
        const validateInputText = (inputClass) => {
            const inputText = document.querySelectorAll(inputClass);
            console.log(inputText.value);
            for (let i = 0; i < inputText.length; i++) {
                if (inputText[i].value == "" || inputText[i].value == undefined || inputText[i].value == null ) {
                    console.log(i);
                    return false;
                }
                console.log(inputText.value);
            }
            return true;
        };
        validateInputText('.admin-form__input-text');
    };

    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(postForm);

        
        if () {
            console.log(JSON.stringify(Object.fromEntries(formData)));
        } else {
            console.error('Ошибка ввода данных');
        }

    });
    for (let i = 0; i++; i < 5) {
        console.log('Я');
    }

});