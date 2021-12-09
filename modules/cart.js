import {showAlertInfo,showPopInfo} from './popInfo.js';

const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/metisteng/`;
const shoppingCartTable = document.querySelector(".shoppingCart-table");

let cartDatabase = [];
export let cart = null;

export function get_cartsApiData(){
    axios.get(`${url}carts`)
    .then(res=>{
        cartDatabase= res.data.carts;
        cart = new Cart(cartDatabase);
        cart.renderHTML();
    })
    .catch(err=>console.error(err))
};
export function Cart(data){
    this.cartItems = data;
    this.cartSum = this.computed_cartSum();
};

Cart.prototype.computed_cartSum = function(){
    if(this.cartItems.length===0){
        this.cartSum = 0;
        return this.cartSum;
    }
    let cartPriceArr = this.cartItems.map(item=>item.product.price*item.quantity);
    this.cartSum = cartPriceArr.reduce(function(total,num){
        return total + num
    })
    return this.cartSum
};

Cart.prototype.renderHTML = function(){
    // Show notification if the cart is empty
    if(this.cartItems.length === 0){
        let cartEmptyInfo = /*html*/`
        <tr class="shoppingCart-empty">
            <th>還是空的...</th>
        </tr>
        `
        shoppingCartTable.innerHTML = cartEmptyInfo;
        return
    };

    // Add table top and bottom rows
    let cartTable = /*html*/`
    <tr class="shoppingCart-header">
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
    </tr>
    <tr>
        <td>
            <button class="discardAllBtn">刪除所有品項</button>
        </td>
        <td></td>
        <td></td>
        <td>
            <p>總金額</p>
        </td>
        <td class="shoppingCart-total"></td>
    </tr>`
    shoppingCartTable.innerHTML = cartTable;

    // Add cart data from api
    
    const shoppingCartHeader = document.querySelector(".shoppingCart-header");
    const shoppingCartTotal = document.querySelector(".shoppingCart-total");
    this.cartItems.forEach((d,i)=>{
        let totalPriceForProduct = d.quantity * d.product.price;
        let newRow = document.createElement("tr");
        let cartHtml = /*html*/`
        <td>
            <div class="cardItem-title">
                <img src="${d.product.images} "alt="">
                <p>${d.product.title}</p>
            </div>
        </td>
        <td>NT$${d.product.price}</td>
        <td class="product-qty" data-index="${i}"><input readonly="true" type="number" placeholder="${d.quantity}" value="${d.quantity}"/></td>
        <td>NT$${totalPriceForProduct}</td>
        <td class="cartBtn" data-index="${i}" data-id="${d.id}"">
            <button class="editBtn material-icons">
                edit
            </button>
            <button class="discardBtn material-icons">
            clear
            </button>
        </td>`
        newRow.innerHTML = cartHtml;
        shoppingCartHeader.parentNode.insertBefore(newRow,shoppingCartHeader.nextSibling);
        shoppingCartTotal.textContent= `NT$${this.cartSum}`;

        // add event listeners
        let _this = this;
        
        // delete a single product
        document.querySelector(".cartBtn").addEventListener('click',function(e){
            let currentId = this.getAttribute("data-id");
            let currentIndex = this.getAttribute("data-index")
            if(this !== e.target){
                if(e.target.classList.contains("editBtn")){
                    _this.editCartItem(currentId,currentIndex);
                    return
                }
                _this.deleteCartItem(currentId);
                _this.renderHTML();

            }
            return
        })
        // delete all products in the cart
        document.querySelector(".discardAllBtn").addEventListener('click',function(){
            showAlertInfo('你確定要清空購物車嗎？')
            const confirmBtn = document.querySelector(".btn-confirm");
            const returnBtn = document.querySelector(".btn-return");
            confirmBtn.addEventListener('click',function(){
                _this.deleteCartAll();
                return
            });
            returnBtn.addEventListener('click',function(){
                return 
            });
            
        })
    });
};

Cart.prototype.deleteCartItem = function(id){
    axios.delete(`${url}carts/${id}`)
    .then(res=>{
        this.cartDatabase = res.data.carts;
        this.cartItems = this.cartDatabase;
        this.computed_cartSum();
        this.renderHTML();
    })
    .catch(err=>console.log(err.message)
    )
};

Cart.prototype.deleteCartAll = function(){
    
    axios.delete(`${url}carts`)
    .then(res=>{
        cartDatabase = res.data.carts;
        this.cartItems = cartDatabase;
        this.computed_cartSum();
        this.renderHTML();
        showPopInfo('購物車已經清空！')
    })
    .catch(err=>console.log(err))
};

Cart.prototype.addToCart = function(id){
    // check if the selected item has in the cart
    if(this.cartItems.length !== 0){
        this.cartItems.forEach(item=>{
        if(item.product.id === id){
            showPopInfo('此項商品已在購物車囉！')
        }
        });
    };
    // add the selected item
    axios.post(`${url}carts`,{
        "data": {
            "productId": id,
            "quantity": 1
        }
    })
    .then(res=>{
        cartDatabase = res.data.carts;
        this.cartItems = cartDatabase;
        this.computed_cartSum();
        cart.renderHTML();
    })
    .catch(err=>console.error(err))
};
// FIXME: the qtyfield would still be edited/focused when it's not in editMode

Cart.prototype.editCartItem = function(id,index){
    // trigger contenteditable on the table-list
    let qtyField = document.querySelectorAll(".product-qty");
    qtyField.forEach(item=>{
        if(item.getAttribute("data-index") === index){            
            item.classList.toggle('editing');
            if(item.classList.contains('editing')){
                editModeOn(item,id);
            }else{
                editModeOff(item)
            }
        }
        
    });

    function editModeOn(item,id){
        let currentProductQty = item.firstChild.value;
        // FIXME: since the 'focus' event has been listening, so it should be remove to avoid firing
        item.firstChild.addEventListener('focus',function (){
            item.firstChild.removeAttribute("readonly");
            item.firstChild.value = null;
            // set Enter key as a method to complete editing
            item.firstChild.addEventListener('keyup',function(e){
            if(e.key=="Enter"){
                item.firstChild.blur();
            }
        })
        });

        item.firstChild.addEventListener('blur',function(){
            // if the qty didn't be changed, give it the original value
            if(!item.firstChild.value){
                item.firstChild.value = item.firstChild.placeholder
            }
            // if the qty has been changed, post it to api
            else{
                currentProductQty = Number(item.firstChild.value);
                // post the data to api
                axios.patch(`${url}carts`,{
                    "data": {
                        "id": `${id}`,
                        "quantity": currentProductQty
                    }
                })
                .then(res=>{
                    cartDatabase = res.data.carts;
                    cart.cartItems = cartDatabase;
                    cart.computed_cartSum();
                    cart.renderHTML();
                    showPopInfo('商品數量已經更新成功！！')
                })
            }
            item.firstChild.setAttribute("readonly",true);
            item.classList.remove('editing');
        })
    };
    function editModeOff(item){
        item.firstChild.setAttribute("readonly",true);
        // item.firstChild.removeEventListener('focus',function(){});
    };
};

