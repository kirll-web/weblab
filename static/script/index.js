'use strict';

document.addEventListener('DOMContentLoaded', () => {
    
    const postForm = document.querySelector('#admin-form');

    const validateForm = (formErrorSelector, inputTextSelector, inputTextClassError, hiddenClass) => {

        const formError = document.querySelector(formErrorSelector);

        const validateInputText = (inputTextSelector, inputTextClassError) => {
            const inputText = document.querySelectorAll(inputTextSelector);
            let validate = true;

            console.log(inputText.value);
            for (let i = 0; i < inputText.length; i++) {
                validate = validateIntput(inputText[i], inputTextClassError, hiddenClass);
            }
            return validate;
        };

        if (validateInputText(inputTextSelector, inputTextClassError)) {
            formError.classList.add(hiddenClass);
            return true;
        } else {
            formError.classList.remove(hiddenClass);
            return false;
        }
        
    };

    const validateIntput = (input, inputTextClassError, hiddenClass) => {
        let validate = true;
        if (input.value == "" || input.value == undefined || input.value == null || input.length > 2) {
            input.classList.add(inputTextClassError);
            input.nextElementSibling.classList.remove(hiddenClass);
            validate = false;
        } else {
            input.classList.remove(inputTextClassError);
            input.nextElementSibling.classList.add(hiddenClass);
        }

        return validate;
    };

    const objClassesForUploadAuthorImage = {
        wrapperSelector: '#adminPostAuthorImageWrapper',
        inputSelector: '.admin__image-input', 
        uploadBtnSelector: '.admin__image-upload', 
        uploadNewBtnSelector: '.admin-form__image-btn_upload-new', 
        removeBtnSelector: '.admin-form__image-btn_remove', 
        imageSelector: ['.admin-form__author-photo-preview', '.admin-preview__photo-author'],
        deleteUploadBtn: true
    };
    
    const objClassesForUploadBigImage = {
        wrapperSelector: '#adminPostBigImageWrapper',
        inputSelector: '.admin__image-input', 
        uploadBtnSelector: '.admin__image-upload', 
        uploadNewBtnSelector: '.admin-form__image-btn_upload-new', 
        removeBtnSelector: '.admin-form__image-btn_remove', 
        imageSelector: ['.admin-form__image-label_big', '.admin-preview__photo_big'],
        deleteUploadBtn: false
    };

    const objClassesForUploadSmallImage = {
        wrapperSelector: '#adminPostSmallImageWrapper',
        inputSelector: '.admin__image-input', 
        uploadBtnSelector: '.admin-form__image-btn_upload', 
        uploadNewBtnSelector: '.admin-form__image-btn_upload-new', 
        removeBtnSelector: '.admin-form__image-btn_remove', 
        imageSelector: ['.admin-form__image-label_small', '.admin-preview__photo_small'],
        deleteUploadBtn: false
    };

    
    const objInputTextAndPreviewText = {
        previewTitle: {
            input: '#adminPostTitle',
            previewText: ['#adminPostTitlePreview', '#adminPostTitlePreviewPost']
        },
        previewDescr: {
            input: '#adminPostShortDescr',
            previewText: ['#adminPostShortDescrPreview', '#adminPostShortDescrPreviewPost']
        },
        previewAuthor: {
            input: '#adminPostAuthorName',
            previewText: ['#adminPostAuthorNamePreview']
        },
        previewDate: {
            input: '#adminPostPublishDate',
            previewText: ['#adminPostPublishDatePreview']
        }
    };

    const updateTextInPreview = (objInputTextAndPreviewText, inputTextClassError, hiddenClass, attrStartText) => {
        for(let key in objInputTextAndPreviewText) {
            let obj, previewTextArr, previewText, input;
            
            obj = objInputTextAndPreviewText[key];
            input = document.querySelector(obj.input);
            previewTextArr = obj.previewText;
            
            input.addEventListener('input', (event) => {
                previewTextArr.forEach((classPreview) => {
                    previewText = document.querySelector(classPreview);
                    previewText.innerHTML =  event.target.value; 
                    validateIntput(event.target, inputTextClassError, hiddenClass);
                    if (event.target.value === '') {
                        previewText.innerHTML = previewText.getAttribute(attrStartText); 
                    }
                    
                });
            });
        }

    };

    updateTextInPreview(objInputTextAndPreviewText, 'admin-form__input-text_error', 'hidden', 'data-preview-text');

    

    

    

    


    const uploadImage = (objClassesForUploadImage, classHidden) => {
        const wrapper = document.querySelector(objClassesForUploadImage.wrapperSelector),
            input = wrapper.querySelector(objClassesForUploadImage.inputSelector),
            uploadBtn = wrapper.querySelector(objClassesForUploadImage.uploadBtnSelector),
            uploadNewBtn = wrapper.querySelector(objClassesForUploadImage.uploadNewBtnSelector),
        removeBtn = wrapper.querySelector(objClassesForUploadImage.removeBtnSelector);

        let imagePreviews = [];

        
    };
    uploadImage(objClassesForUploadAuthorImage, 'hidden');
    uploadImage(objClassesForUploadBigImage, 'hidden');
    uploadImage(objClassesForUploadSmallImage, 'hidden');

    // imagePreviews[i].style.background = `url('${window.URL.createObjectURL(input.files[0])}') center center/contain no-repeat`;

    

    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(postForm);

        const promise = new Promise(function(resolve, reject) {

            if(validateForm('.admin-form__error', '.admin-form__input-text', 'admin-form__input-text_error', 'hidden')) {
                resolve(JSON.stringify(Object.fromEntries(formData)));
            } else {
                reject('Ошибка ввода данных');
            }

        });


        promise
            .then(data => console.log(data))
            .catch(err => console.error(err));
    });

    
});