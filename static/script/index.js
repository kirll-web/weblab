'use strict';

document.addEventListener('DOMContentLoaded', () => {

    const imageForm = {};

    const form = document.querySelector('#adminPost'),
     inputsText = form.querySelectorAll('.admin-form__input-text'),
     inputsTextErrorClass = 'admin-form__input-text_error',
     hiddenClass = 'hidden';

    const inputTextAndPreviewElemId = {
        postTitle: ['previewTitleArticle', 'previewTitlePostCard'], 
        postShortDescr: ['previewDescrArticle', 'previewDescrPostCard'], 
        postAuthorName: ['previewAuthorNamePostCard'], 
        postPublishDate: ['previewDatePostCard']
    };

    const componentsImageObj = {
        inputsImage: {
            postAdminPhoto: {
                inputWrapper: 'adminFormAuthorPhoto',
                previewsObj: ['previewAuthorPhotoInput', 'previewAuthorPhotoPostCard'],
                deleteUploadBtnBoolean: true,
                deleteImageInfo: false
            }, 
            postBigImage: {
                inputWrapper: 'adminFormBigImage',
                previewsObj: ['previewBigImageInput', 'previewBigImageArticle'],
                deleteUploadBtnBoolean: false,
                deleteImageInfo: true
            },
            postSmallImage: {
                inputWrapper: 'adminFormSmallImage',
                previewsObj: ['previewSmallImageInput', 'previewSmallImagePostCard'],
                deleteUploadBtnBoolean: false,
                deleteImageInfo: true
            }
        },

        buttons: {
            btnImageUploadSelector: '.admin-form__input-upload',
            removeAndUploadNewBtnsWrapper: '.admin-form__input-btn-wrapper',
            imageInfo: '.admin-form__image-info',
            removeBtnSelector: '.admin-form__input-remove'
        }

    };

    const uploadImageInFormData = async (imageForm, input) => {
        let reader = new FileReader();

        if (input.files[0]) {
            reader.readAsDataURL(input.files[0]);
            reader.onloadend  =  () => {
                imageForm[input.getAttribute('name')] = String(reader.result);
                imageForm[`${input.getAttribute('name')}Name`] = input.files[0].name;
            };
        } else {
            imageForm[input.getAttribute('name')] = '';
            imageForm[`${input.getAttribute('name')}Name`] = '';
        }
    };

    const workWithImageInput = (componentsImageObj) => {

        const inputsImageObj =  componentsImageObj.inputsImage;

        const updatePreviews = (arrPreviews, style) =>{
            arrPreviews.forEach(preview => {
                 document.querySelector(`#${preview}`).style.background = `${style}`;
            });
        };

         const showAndHideUploadNewAndRemoveBtns = (show, imageObj, wrapper, wrapperBtns) =>  {
            if (show) {
                if (imageObj.deleteUploadBtnBoolean) {
                    wrapper.querySelector(componentsImageObj.buttons.btnImageUploadSelector).classList.add(hiddenClass);
                }

                if (imageObj.deleteImageInfo) {
                    wrapper.querySelector(componentsImageObj.buttons.imageInfo).classList.add(hiddenClass);
                }
                wrapperBtns.classList.remove(hiddenClass);
            } else {
                if (imageObj.deleteUploadBtnBoolean) {
                    wrapper.querySelector(componentsImageObj.buttons.btnImageUploadSelector).classList.remove(hiddenClass);
                }

                if (imageObj.deleteImageInfo) {
                    wrapper.querySelector(componentsImageObj.buttons.imageInfo).classList.remove(hiddenClass);
                }
                wrapperBtns.classList.add(hiddenClass);
            }
        };

        for (let key in inputsImageObj) {
            let input = document.querySelector(`#${key}`),
            wrapper = document.querySelector(`#${inputsImageObj[key].inputWrapper}`),
            wrapperBtns = wrapper.querySelector(componentsImageObj.buttons.removeAndUploadNewBtnsWrapper),
            removeBtn = wrapper.querySelector(componentsImageObj.buttons.removeBtnSelector);

            input.addEventListener('input', () => {

                if (input.files[0]) {
                    updatePreviews(inputsImageObj[key].previewsObj, 
                        `url('${window.URL.createObjectURL(input.files[0])}') center center/cover no-repeat`);

                    showAndHideUploadNewAndRemoveBtns(true, inputsImageObj[key], wrapper, wrapperBtns);

                    uploadImageInFormData(imageForm, input);
                } 

            });
            
            removeBtn.addEventListener('click', (event) => {
                event.preventDefault();

                const attrFor = event.target.getAttribute('for'),
                    input = document.querySelector(`#${attrFor}`);

                input.value = '';

                updatePreviews(inputsImageObj[key].previewsObj, '');

                showAndHideUploadNewAndRemoveBtns(false, inputsImageObj[key], wrapper, wrapperBtns);

                uploadImageInFormData(imageForm, input);
                
            });

        }
    };

    workWithImageInput(componentsImageObj);

    const activateErrorInputText = (input, inputsTextErrorClass, hiddenClass) => {
        input.classList.add(inputsTextErrorClass);
        input.nextElementSibling.classList.remove(hiddenClass);
    };

    const deactivateErrorInputText = (input, inputsTextErrorClass, hiddenClass) => {
        input.classList.remove(inputsTextErrorClass);
        input.nextElementSibling.classList.add(hiddenClass);
    };

    const validateForm = (inputsText) => {
        return validateInputsText(inputsText);
    };
    
    const validateInputsText = (inputs) => {
        let validate = true;
        inputs.forEach(input => {
            if(input.value === '' || input.value === null ||  input.value === undefined) {
                validate = false; 
                activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            }
        });

        return validate;
    };

    const showPreviewTextInputs = (inputTextAndPreviewElemId) => {
        let elem, previewElem;
        for(let elemId in inputTextAndPreviewElemId) {
            elem = document.querySelector(`#${elemId}`);
            inputTextAndPreviewElemId[elemId].forEach(idPreview => {
                previewElem = document.querySelector(`#${idPreview}`);
                if (elem.value != '') {
                    previewElem.innerHTML = elem.value;
                } else {
                    previewElem.innerHTML = previewElem.getAttribute('data-default-value');
                }
            });
        }
    };

    inputsText.forEach(input => {
        input.addEventListener('input', () => {
            showPreviewTextInputs(inputTextAndPreviewElemId);
            if(input.value === '' || input.value === null ||  input.value === undefined) {
                activateErrorInputText(input, inputsTextErrorClass, hiddenClass);
            } else {
                deactivateErrorInputText (input, inputsTextErrorClass, hiddenClass);
            }
        });
    });


    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form),
              newFormData = Object.fromEntries(formData),
              infoComponent = form.querySelector('.admin-form__info');

        const infoAboutStateSubmitForm = {
            success: {
                infoClass: 'admin-form__success',
                text: 'Publish Complete!'
            },
            error: {
                infoClass: 'admin-form__error',
                text: 'Whoops! Some fields need your attention :o',
            }
        };

        function showError(error) {
            infoComponent.classList.remove(infoAboutStateSubmitForm.success.infoClass);
            infoComponent.classList.add(infoAboutStateSubmitForm.error.infoClass);
            // infoComponent.classList.remove(hiddenClass);
            infoComponent.innerHTML = error;
        }

        function showSuccess() {
            infoComponent.classList.remove(infoAboutStateSubmitForm.error.infoClass);
            infoComponent.classList.add(infoAboutStateSubmitForm.success.infoClass);
            // infoComponent.classList.remove(hiddenClass);
            infoComponent.innerHTML = infoAboutStateSubmitForm.success.text;
        }
        
        if (validateForm(inputsText)) {
            for (let key in imageForm) {
                newFormData[key] = imageForm[key];
            }

            console.log(newFormData);
            console.log(JSON.stringify(newFormData));

            const createPost = fetch("/create-post", {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify(newFormData)
            });

            createPost.then((response) => {
                response.text().then(function (data) {
                    let result = data;
                    if(result) {
                        showError(result);
                        console.error('Ошибка!');
                    } else {
                        showSuccess();
                    }
                });
            }).catch((error) => {
                showError(infoAboutStateSubmitForm.error.text);
                console.error('Ошибка!');
            });

        } else {
            showError(infoAboutStateSubmitForm.error.text);
            console.error('Ошибка!');
        }

    });
    
});