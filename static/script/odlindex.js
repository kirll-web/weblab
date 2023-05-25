'use strict';

document.addEventListener('DOMContentLoaded', () => {
    
    const image = {
        
    };
    const postForm = document.querySelector('#admin-form');

    const validateForm = (formErrorSelector, inputTextSelector, inputTextClassError, hiddenClass) => {

        const formError = document.querySelector(formErrorSelector);

        const validateInputText = (inputTextSelector, inputTextClassError) => {
            const inputText = document.querySelectorAll(inputTextSelector);
            let validate = true;

            for (let i = 0; i < inputText.length; i++) {
                inputText[i].addEventListener('input', (event) => {
                    validateIntput(event.target, inputTextClassError, hiddenClass)
                });
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
        if (input.value === "" || input.value == undefined || input.value == null || input.length > 2) {
            input.classList.add(inputTextClassError);
            input.nextElementSibling.classList.remove(hiddenClass);
            validate = false;
        } else {
            input.classList.remove(inputTextClassError);
            input.nextElementSibling.classList.add(hiddenClass);
        }

        return validate;
    };


    const objUploadInput = {
        authorImage: {
            wrapperSelector: '#adminPostAuthorImageWrapper',
            imageSelector: ['.admin-form__author-photo-preview', '.admin-preview__photo-author'],
            deleteUploadBtn: true
        },
        bigImage: {
            wrapperSelector: '#adminPostBigImageWrapper',
            imageSelector: ['.admin-form__image-label_big', '.admin-preview__photo_big'],
            deleteUploadBtn: false
        },
        smallImage: {
            wrapperSelector: '#adminPostSmallImageWrapper',
            imageSelector: ['.admin-form__image-label_small', '.admin-preview__photo_small'],
            deleteUploadBtn: false
        }

    };

    const objClassesInputAndBtnsForUploadImage = {
        inputSelector: '.admin__image-input', 
        uploadBtnSelector: '.admin__image-upload', 
        uploadNewBtnSelector: '.admin-form__image-btn_upload-new', 
        removeBtnSelector: '.admin-form__image-btn_remove',
        hiddenClass: 'hidden'
    };


    const uploadImage = (objUploadInput, objClassesForInputAndBtn) => {
        let reader = new FileReader();

        const inputSelector = objClassesForInputAndBtn.inputSelector,
        uploadBtnSelector = objClassesForInputAndBtn.uploadBtnSelector,
        uploadNewBtnSelector = objClassesForInputAndBtn.uploadNewBtnSelector,
        removeBtnSelector = objClassesForInputAndBtn.removeBtnSelector,
        hiddenClass = objClassesForInputAndBtn.hiddenClass;


        const updateAndRemoveImage = (update, input,imageSelectorArr, uploadBtn, uploadNewBtn, removeBtn, deleteUploadBtn) => {
            let imagePreviews;
            if (update) {
                imageSelectorArr.forEach(selector => {
                    imagePreviews = document.querySelector(selector);

                    imagePreviews.style.background = `url('${window.URL.createObjectURL(input.files[0])}') center center/contain no-repeat`;

                    imagePreviews.classList.add('admin-form__setting-image');
                });

                if (deleteUploadBtn) {
                    uploadBtn.classList.add(hiddenClass);
                    uploadNewBtn.classList.remove(hiddenClass);
                    removeBtn.classList.remove(hiddenClass);
                } else {
                    uploadNewBtn.classList.remove(hiddenClass);
                    removeBtn.classList.remove(hiddenClass);
                }
            } else {
                input.value = ""; 
                imageSelectorArr.forEach(selector => {
                    imagePreviews = document.querySelector(selector);
                    imagePreviews.style.background = ``;
                    imagePreviews.classList.remove('admin-form__setting-image');
                });
                if (deleteUploadBtn) {
                    uploadBtn.classList.remove(hiddenClass);
                    uploadNewBtn.classList.add(hiddenClass);
                    removeBtn.classList.add(hiddenClass);
                } else {
                    uploadNewBtn.classList.add(hiddenClass);
                    removeBtn.classList.add(hiddenClass);
                }
            }
        };

        for (let key in objUploadInput) {
            
            let obj = objUploadInput[key],
            wrapper = document.querySelector(obj.wrapperSelector),
            input = wrapper.querySelector(inputSelector),
            uploadBtn = wrapper.querySelector(uploadBtnSelector),
            uploadNewBtn = wrapper.querySelector(uploadNewBtnSelector),
            removeBtn = wrapper.querySelector(removeBtnSelector),
            imageSelectorArr = obj.imageSelector,
            deleteUploadBtn = obj.deleteUploadBtn,
            nameInput;
            

            input.addEventListener('input', (event) => {
                updateAndRemoveImage(true, event.target, imageSelectorArr, uploadBtn, uploadNewBtn, removeBtn, deleteUploadBtn);
                if (input.files[0]) {
                    reader.readAsDataURL(input.files[0]);
                    reader.onloadend = () => {
                        nameInput = input.getAttribute('name');
                        image.nameInput = {
                            imageInBase64: String(reader.result),
                            nameFile: input.files[0].name
                        };
                    };
                    
                }
            });

            removeBtn.addEventListener('click', () => {
                updateAndRemoveImage(false, input,imageSelectorArr, uploadBtn, uploadNewBtn, removeBtn, deleteUploadBtn);
                image[input.getAttribute('name')] = '';
            });
        }
    };
    uploadImage(objUploadInput, objClassesInputAndBtnsForUploadImage);


    const objInputTextAndPreviewText = {
        previewTitle: {
            input: '#adminPostTitle',
            previewText: ['#adminPostTitlePreview', '#adminPostTitlePreviewPost'],
            required: true
        },
        previewDescr: {
            input: '#adminPostShortDescr',
            previewText: ['#adminPostShortDescrPreview', '#adminPostShortDescrPreviewPost'], 
            required: true
        },
        previewAuthor: {
            input: '#adminPostAuthorName',
            previewText: ['#adminPostAuthorNamePreview'],
            required: true
        },
        previewDate: {
            input: '#adminPostPublishDate',
            previewText: ['#adminPostPublishDatePreview'],
            required: false
        },
        previewContent: {
            input: '#adminPostText',
            previewText: [],
            required: true
        }
    };

    const updateTextInPreview = (objInputTextAndPreviewText, inputTextClassError, hiddenClass, attrStartText) => {

        for(let key in objInputTextAndPreviewText) {
            let obj, previewTextArr, previewText, input, required;

            obj = objInputTextAndPreviewText[key];
            input = document.querySelector(obj.input);
            previewTextArr = obj.previewText;
            required = obj.required;
            
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
    
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(postForm);

        const promise = new Promise(function(resolve, reject) {

            if(validateForm('.admin-form__error', '.admin-form__input-text', 'admin-form__input-text_error', 'hidden') ) {
                // for (let key in image) {
                //     // formData.set(key, image[key].imageInBase64);
                //     // formData.set(key, image[key].);
                // }

                let obj = Object.fromEntries(formData);
                
                for (let key in image) {
                    // formData.set(key, image[key].imageInBase64);
                    // formData.set(key, image[key].);
                }

                const createPost = fetch("/create-post", {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify(obj)
                });

                createPost.then((response) => {
                    response.text().then(function (data) {
                        let result = JSON.parse(data);
                        console.log(result);
                    });
                }).catch((error) => {
                    console.log(error);
                });

                postForm.reset();
                resolve(JSON.stringify(Object.fromEntries(formData)));
            } else {
                reject('Ошибка ввода данных');
            }
        });

        promise
            .then(data => console.log(data));

        

        // askButton.addEventListener("click", function () {
        //     let data = {
        //         Name: name.value,
        //         Time: new Date().toLocaleString("en-IE"),
        //     };
        //     fetch("/get_time", {
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json'
        //         },
        //         method: "POST",
        //         body: JSON.stringify(data)
        //     }).then((response) => {
        //         response.text().then(function (data) {
        //             let result = JSON.parse(data);
        //             console.log(result)
        //         });
        //     }).catch((error) => {
        //         console.log(error)
        //     });
        

        
        
    });

    
});