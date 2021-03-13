(function () {
  'use strict';

  class ApplicationMenu {
    constructor(menu_el) {
      this.menu = menu_el;
    }
    
    openMenu() {
      this.menu.classList.add("active");
    }
    
    closeMenu() {
      this.menu.classList.remove("active");
    }
  }

  function main() {
    const menu_element = document.getElementById("menu"); 
    const menu_btns = document.querySelectorAll("[data-action='toggle-menu']");
    let menu_api = new ApplicationMenu(menu_element);
    menu_btns.forEach(btn => {
      btn.addEventListener("click", () => {
        if (menu_element.classList.contains("active"))
          menu_api.closeMenu();
        else
          menu_api.openMenu();
      });
    });
  } main();

}());
