const adminUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/metisteng/orders';
const token = 'MivHYzzmsmQkLmryd11vj2SqdGS2';
const popupInfo = document.querySelector(".popup-info");
const headers = {
    headers:{
        "Authorization":token
    }
};
let ordersData = [];
let currentPaid = null;
// ===== Init ===== //
function init(){
    get_order();
};
init();

function get_order(){
    axios.get(adminUrl,headers)
    .then(res=>{
        console.log(res.data.orders);
        ordersData = res.data.orders;
        renderTableHtml(ordersData);
        renderChart();
    })
    .catch(err=>console.error(err))
}

// ===== Order List ===== //
const orderTable = document.querySelector(".orderPage-table");
const orderList = document.querySelector(".orderPage-list");
const deleteAllBtn = document.querySelector(".discardAllBtn");
function renderTableHtml(arr){
    // check if the arr is empty
    if(ordersData.length == 0){
        document.querySelector(".charts").innerHTML = "";
        orderList.innerHTML = /*html*/`<h1 class='section-title'>目前還沒有訂單喔！我們再接再厲💪🏼</h1>`;
        return
    }

    orderTable.innerHTML = "";
    let orderTableHeader = /*html*/`
        <thead class="orderPage-table-header">
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>`
        orderTable.innerHTML = orderTableHeader;

    arr.forEach((item,index)=>{
        let newRow = document.createElement("tr");
        let newInner = /*html*/ `
        <td>${item.id}</td>
        <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td>
            <ul class="order-products"></ul>
        </td>
        <td class="order-date"></td>
        <td class="orderStatus"></td>
        <td>
            <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
        </td>
        `
        newRow.innerHTML = newInner;
        orderTable.append(newRow);
        // Add prodcut tags
        addTableContents(item,index);
    })
    // Add event listener
    const delSingleOrder = document.querySelectorAll(".delSingleOrder-Btn");
        delSingleOrder.forEach(btn=>{
            btn.addEventListener('click',function(){
                let currentId = btn.getAttribute("data-id")
                deleteOrder(currentId)
            })
    })

    const orderStatusBtn = document.querySelectorAll(".orderStatus button")
    orderStatusBtn.forEach(btn=>{
        btn.addEventListener('click',function(){
            let currentId = btn.getAttribute("data-id");
            edit_paidStatus(currentId);
        })
    })
}

function addTableContents(item,index){
    // Add products to the list
    const orderProducts = document.querySelectorAll(".order-products");
    const orderDate  = document.querySelectorAll(".order-date");
    const orderStatus = document.querySelectorAll(".orderStatus");

    let productTitles = [];
    for(let i = 0 ; i<item.products.length; i++){
        let title = item.products[i].title;
        productTitles.push(title);
    };
    
    productTitles.forEach(item=>{
        let newProduct = document.createElement("li");
        newProduct.textContent = item;
        orderProducts[index].append(newProduct);
    });

    // Time Converter
    let milliseconds = item.createdAt*1000;
    let dateObj = new Date(milliseconds).toLocaleDateString();
    orderDate[index].textContent = dateObj;

    // Payment Status
    let statusBtn = document.createElement("button");
    statusBtn.dataset.id = item.id;
    if(item.paid){
        statusBtn.classList.add("orderStatus-done");
        statusBtn.textContent = '已處理';
    }else{
        statusBtn.classList.remove("orderStatus-done");
        statusBtn.textContent = '未處理';
    }
    orderStatus[index].append(statusBtn);
}

// Edit payment Status
function edit_paidStatus(id){
    let currentOrder = ordersData.filter(item=>item.id === id);
    let currentPaymentStatus = currentOrder[0].paid;
    axios.put(adminUrl,{
        "data": {
            "id": `${id}`,
            "paid": !currentPaymentStatus
        }
    },headers)
    .then(res=>{
        ordersData = res.data.orders;
        renderTableHtml(ordersData);
        renderGauge();
    })
    .catch(err=>console.error(err))
};

// Delete a single Order
function deleteOrder(id){
    console.log('delete',id);
    axios.delete(`${adminUrl}/${id}`,headers)
    .then(res=>{
        console.log(res.data.orders);
        ordersData = res.data.orders;
        renderTableHtml(ordersData);
    })
    .catch(err=>console.log(err));
};
// Delete ALL orders
function deleteOrder_all(){
    axios.delete(adminUrl,headers)
    .then(res=>{
        ordersData = res.data.orders;
        renderTableHtml(ordersData);
        popupInfo.classList.remove("show");
    })
    .catch(err=>console.error(err))
};

deleteAllBtn.addEventListener('click',function(){
    showAlertInfo('你確定要清除全部清單？這個動作無法被回復喔！')
    const confirmBtn = document.querySelector(".btn-confirm");
    const returnBtn = document.querySelector(".btn-return");
    confirmBtn.addEventListener('click',()=>{
        deleteOrder_all();
    })
    returnBtn.addEventListener('click',()=>{
        popupInfo.classList.remove("show");
        return
    })
});

// create a section to filter paid/unpaid orders
const orderStatus = document.querySelector(".order-status");
orderStatus.addEventListener('change',function(){
    let filteredVal = orderStatus.value
    let filteredBooleanVal = filteredVal.toLowerCase() == 'true' ? true : false;
    let filteredData = [];

    if(filteredVal=="all"){
        filteredData = ordersData
        renderTableHtml(filteredData);
        return filteredData
    }
    filteredData = ordersData.filter(item=>item.paid == filteredBooleanVal);
    console.log(filteredData,ordersData)
    renderTableHtml(filteredData);
})

// TODO: hover on the pie chart to see the income of each section
// TODO: showing the total profit beside the chart
// ===== Pie Chart===== //
let products = {};
let chartColumn = [];
let sortedColumn = [];
function computed_orderNum(){
    if(ordersData.length == 0){
        return
    }
    if(ordersData.length == 1){
        chartColumn = [ordersData[0].products[0].title,ordersData[0].quantity]
        sortedColumn.push(chartColumn);
        console.log(sortedColumn)
        return
    }
    // get qty of each product
    ordersData.forEach(order=>{
        order.products.forEach(product=>{
        if(!products[product.title]){
            products[`${product.title}`] = 0;
            products[`${product.title}`] += product.quantity;
            return
        }
        products[`${product.title}`] += product.quantity
    })
    })
    // convert obj into arr
    let keys = Object.keys(products);
    keys.forEach(key=>{
        let productQty = products[key]
        let newArr = [key,productQty]
        chartColumn.push(newArr)

    })
    // Sort Descending
    sortedColumn = chartColumn.sort((a,b)=>b[1] - a[1]);
    
    // Sort products to show from the frist to the forth 
    sortedColumn = sortedColumn.slice(0,3);
    let otherArr = chartColumn.slice(2);
    let otherSum = 0;
    otherArr.forEach(item=>{
        otherSum += item[1]
        otherArr = ['其他', otherSum]
    })
    sortedColumn.push(otherArr)
};

function renderChart(){
    computed_orderNum();
    let pieChart = c3.generate({
        bindto: '#pie',
        data: {
            type:'pie',
            columns: sortedColumn
        },
        color:{
            pattern:['#A640FF','#7124E0','#6A33F8','#4224E0','#6D67FA']
        }
    });
    renderGauge()
};
function renderGauge(){
    // uppaid orders
    currentPaid = ordersData.filter(item=>item.paid==true).length
    let gaugeChart = c3.generate({
        bindto:"#gauge",
        data:{
            type:'gauge',
            columns: [['已處理',currentPaid]]
        },
        gauge:{
            max:`${ordersData.length}`,
        },
        color:{
            pattern:['#6D67FA']
        }
    })
}

// ===== Reusable functions ===== //
function showPopInfo(txt){
    popupInfo.classList.remove("alert");
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