import {cart} from './cart.js';
import { showPopInfo } from './popInfo.js';

const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/metisteng/`;
const form = document.querySelector(".orderInfo-form");
const orderInfoMessage = document.querySelectorAll(".orderInfo-message");
const orderInfoInput = document.querySelectorAll('.orderInfo-input');
const popupInfo = document.querySelector(".popup-info");

export default function Form(){
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
};

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
};
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
};
