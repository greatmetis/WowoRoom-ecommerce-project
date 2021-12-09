import {cart} from './cart.js';

const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/metisteng/`;
let database = [];
export let products = null;

const productWrap = document.querySelector(".productWrap");
;

export function get_productsApiData(){
    console.log(url)
    axios.get(`${url}products`)
    .then(res=>{
        database = res.data.products;
        products = new Products();
        products.renderHTML();
    })
    .catch(err=>console.error(err))
};

function Products(){
    this.products = database;
};

Products.prototype.renderHTML= function(){
    productWrap.innerHTML = "";
    this.products.forEach(item=>{
        let productCard = document.createElement("li");
        productCard.setAttribute("class","productCard");
        let productHtml = /*html*/`
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="image:${item.title}">
        <button class="addCardBtn" data-id="${item.id}">加入購物車</button>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
        `
        productCard.innerHTML = productHtml;
        productWrap.append(productCard);
    })

    // add event listener
    let _this = this;
    const addCardBtn = document.querySelectorAll(".addCardBtn");
    addCardBtn.forEach(btn=>{
        btn.addEventListener('click',function(){
            let id = this.getAttribute("data-id")
            cart.addToCart(id)
            cart.renderHTML()
        })
    })

};
// Filter for product display section
Products.prototype.filter = function(val){
    if(val==='全部'){
        this.products = database;
        this.renderHTML();
        return this.products;
    }
    this.products = database.filter(item=>item.category===val);
    this.renderHTML();
};