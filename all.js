const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/metisteng/`;
const popupInfo = document.querySelector(".popup-info");
const orderBtn = document.querySelector(".orderInfo-btn");
let database = [];
let cartDatabase = [];
let cart = null;
let products = null;


// init function execution
function init(){
    get_productsApiData();
    get_cartsApiData();
};
init();

// get the items from api && show on the screen
function get_productsApiData(){
    axios.get(`${url}products`)
    .then(res=>{
        database = res.data.products;
        products = new Products();
        products.renderHTML();
    })
    .catch(err=>console.error(err))
};
function get_cartsApiData(){
    axios.get(`${url}carts`)
    .then(res=>{
        cartDatabase= res.data.carts;
        cart = new Cart(cartDatabase);
        cart.renderHTML();
    })
    .catch(err=>console.error(err))
};

// ===== Cart ===== //
const shoppingCartTable = document.querySelector(".shoppingCart-table");

function Cart(data){
    this.cartItems = data;
    this.cartSum = this.computed_cartSum();
}

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
}

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
}

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
}

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
}

Cart.prototype.editCartItem = function(id,index){
    // trigger contenteditable on the table-list
    const qtyField = document.querySelectorAll(".product-qty");
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
                cursorStatus(false);
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
                    cursorStatus(true)
                })
            }
            item.firstChild.setAttribute("readonly",true);
            item.classList.remove('editing');
        })
    };
    function editModeOff(item){
        item.firstChild.setAttribute("readonly",true);
    };
};

// ===== ProductDisplay ===== //
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");

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

}
// Filter for product display section
Products.prototype.filter = function(val){
    if(val==='全部'){
        this.products = database;
        this.renderHTML();
        return this.products;
    }
    this.products = database.filter(item=>item.category===val);
    this.renderHTML();
}
productSelect.addEventListener('change',function(){
    products.filter(productSelect.value)
})

// ===== Order Form ===== //
const form = document.querySelector(".orderInfo-form");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");
const orderInfoInput = document.querySelectorAll('.orderInfo-input');


function Form(){
    this.validation = false,
    this.constraints = {
        姓名:{
            presence: {
                message:"^必填, required"
            }
        },
        電話:{
            presence: {
                message:"^必填, required"
            },
            length:{
                minimum:8,
                maximum:12,
                tooShort:"^請輸入有效電話, must be between 8-12 characters",
                tooLong:"^請輸入有效電話, must be between 8-12 characters"
            },
            format:{
                pattern:"[0-9]+",
                message:"^電話只能是數字, Numeric characters only"
            }
            
        },
        Email:{
            email:true,
            presence:{
                message:"^必填, required"
            },
        },
        寄送地址:{
            presence:{
                message:"^必填, required"
            }
        }
    },
    this.orderForm = {
        "data": {
            "user": {
                "name": `${orderInfoInput[0].value}`,
                "tel": `${orderInfoInput[1].value}`,
                "email": `${orderInfoInput[2].value}`,
                "address": `${orderInfoInput[3].value}`,
                "payment": `${orderInfoInput[4].value}`
            }
        }
    }
}

 // Form validation
Form.prototype.formValidation = function(){
    // check if the carts is empty
    if(cart.cartItems.length == 0){
        showPopInfo('⚠️訂單送出失敗！因為你的購物車還是空的喔～');
        popupInfo.classList.add("alert");
        setTimeout(()=>popupInfo.classList.remove("alert"),4000)
        return
    }; 
    let errors = validate(form,this.constraints);
    if(errors){
        Object.keys(errors).forEach(err=>{
            document.querySelector(`p[data-message="${err}"]`).textContent = `${errors[err]}`
        })
        return
    };
    this.validation = true;
}
 // Send order
Form.prototype.postOrder = function(){
    // check validation
    this.formValidation();
    // create form
    if(this.validation){
        axios.post(`${url}orders`,this.orderForm)
        .then(res=>{
            console.log(res.data)
            showPopInfo('我們已經收到你的訂單！您的商品預計7天內送達 ;)')
            form.reset();
        })
        .catch(err=>console.error(err));
    }
    // add event listenr for inputs 
    let _this = this;
    orderInfoInput.forEach(input=>input.addEventListener("change",function(){
    // empty old msg
    orderInfoMessage.forEach(item=>item.textContent = "");
    // re-render new msg if needed
    _this.formValidation();
    })
)
}
// Event Listener - Send order
orderBtn.addEventListener('click',function(e){
    e.preventDefault();
    let newOrder = new Form;
    newOrder.postOrder(e);

})


// ===== Reusable functions ===== //
function showPopInfo(txt){
    popupInfo.innerHTML=/*html*/`<p>${txt}</p>`
    popupInfo.classList.add("show");
    setTimeout(function(){
        popupInfo.classList.remove("show");
    },3000)
    return 
}

function showAlertInfo(txt){
    popupInfo.innerHTML=/*html*/
    `<p>${txt}</p>
    <button class="btn-confirm">是</button>
    <button class="btn-return">否</button>
    `
    popupInfo.classList.add("show",'alert');
}

function cursorStatus(val){
    if(!val){
        document.body.style.pointerEvents = "none";
        return    
    }
    document.body.style.pointerEvents = "auto";
    
}
