import {get_cartsApiData,cart}from './modules/cart.js';
import {get_productsApiData,products} from './modules/products.js';
import Form from './modules/form.js';


// const popupInfo = document.querySelector(".popup-info");
const orderBtn = document.querySelector(".orderInfo-btn");

// init function execution
function init(){
    get_productsApiData(); // render product section
    get_cartsApiData(); // render cart section
};
init();

// ===== ProductDisplay ===== //
const productSelect = document.querySelector(".productSelect");
productSelect.addEventListener('change',function(){
    products.filter(productSelect.value)
})

// Event Listener - Send order
orderBtn.addEventListener('click',function(e){
    e.preventDefault();
    let newOrder = new Form;
    newOrder.postOrder(e);
})