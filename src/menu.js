export default class ApplicationMenu {
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