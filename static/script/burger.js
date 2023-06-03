'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const burger = (burgerSelector, burgerActiveClass, menuSelector, menuActiveClass, menuItemSelector) => {
        const burger = document.querySelector(burgerSelector),
        menu = document.querySelector(menuSelector),
        menuItems = document.querySelectorAll(menuItemSelector);

        burger.addEventListener('click', () => {
            toggleBurgerAndMenu();
        });

        menuItems.forEach(menuItem => {
            menuItem.addEventListener('click', () => {
                toggleBurgerAndMenu();
            });
        });

        function toggleBurgerAndMenu() {
            burger.classList.toggle(burgerActiveClass);
            menu.classList.toggle(menuActiveClass);
        }
    };

    burger('.burger-menu', 'burger-menu_active', '.header__menu', 'header__menu_visible', 'header__menu-item');
});