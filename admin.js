const adminUrl = 'https://livejs-api.hexschool.io/api/livejs/v1/admin/metisteng/orders';
const token = 'MivHYzzmsmQkLmryd11vj2SqdGS2';
const headers = {
    headers:{
        "Authorization":token
    }
};
let ordersData = [];

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
        renderTableHtml();
        computed_orderNum();
        renderChart();
    })
    .catch(err=>console.error(err))
}

// ===== Order List ===== //
const orderTable = document.querySelector(".orderPage-table");
// const orderTableHeader = document.querySelector(".orderPage-table-header")
const deleteAllBtn = document.querySelector(".discardAllBtn");
function renderTableHtml(){
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

    ordersData.forEach((item,index)=>{
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
        renderTableHtml();
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
        renderTableHtml();
    })
    .catch(err=>console.log(err));
};
// Delete ALL orders
function deleteOrder_all(){
    axios.delete(adminUrl,headers)
    .then(res=>{
        ordersData = res.data.orders;
    })
    .catch(err=>console.error(err))
};

deleteAllBtn.addEventListener('click',function(){
    deleteOrder_all()
});

// TODO: create a section to filter paid/unpaid orders
// TODO: hover on the pie chart to see the income of each section
// TODO: showing the total profit beside the chart
// ===== Pie Chart===== //
let products = {};
let chartColumn = [];
let sortedColumn = [];
function computed_orderNum(){
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
    sortedColumn = sortedColumn.slice(0,4);
    let otherArr = chartColumn.slice(3);
    let otherSum = 0;
    otherArr.forEach(item=>{
        otherSum += item[1]
        otherArr = ['其他', otherSum]
    })
    sortedColumn.push(otherArr)
    console.log(sortedColumn)
};

function renderChart(){
    let chart = c3.generate({
        bindto: '#chart',
        data: {
            type:'pie',
            columns: sortedColumn
        },
        color:{
            pattern:['#A640FF','#7124E0','#6A33F8','#4224E0','#6D67FA']
        }
    });

};



