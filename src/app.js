import "./scss/header-style.scss";
import "./scss/general-style.scss";

import ApplicationMenu from "./menu";

function main() {
  const menu_element = document.getElementById("menu"); 
  const menu_btn = document.getElementById("menu-btn");
  let menu_api = new ApplicationMenu(menu_element);
  menu_btn.addEventListener("click", () => {
    if (menu_element.classList.contains("active"))
      menu_api.closeMenu();
    else
      menu_api.openMenu();
  });
}; main();