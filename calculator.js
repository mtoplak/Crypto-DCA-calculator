function calculate(startDate, cryptocurrency, purchaseAmount, frequency){
    $('#result').html('<h3>I have spent a total of <span id="total" class="strong"></span>$ on <span id="coinamount" class="strong"></span> <span class="coin" class="strong"></span> since <span id="startdate" class="strong"></span>.<div id="second"></div> <div id="third"> My total investment is <span id="profit" class="strong"></span> and I have invested <span id="times" class="strong"></span> times. My average buy price was <span id="average" class="strong"></span>$.</div></h3>');
    $('#share-button').html(`Share the result: <button id='copy' data-toggle='tooltip' data-placement='top' title='Copy' onclick='share();'><img src='icons/copy.png'></button>`);
    try{
        if (!startDate){
            calculateTimes();
        }
        else{
           calculateTimes(startDate, cryptocurrency, purchaseAmount, frequency); 
        }
    }
    catch(err){
        console.log(err);
    }
    
    return false;
}

function load(){
    if(localStorage.getItem('startDate')!=null){
        let startDate = localStorage.getItem('startDate');
        let cryptocurrency = localStorage.getItem('cryptocurrency');
        let purchaseAmount = localStorage.getItem('purchaseAmount');
        let frequency = localStorage.getItem('frequency');
        calculate(startDate, cryptocurrency, purchaseAmount, frequency);
        startDate = Date.parse(startDate);
        startDate = new Date(startDate);
        startDate=startDate.toISOString();
        document.forms[0][0].value = startDate.slice(0, 10); 
        document.forms[0][1].value = cryptocurrency;
        document.forms[0][2].value = purchaseAmount;
        document.forms[0][3].value = frequency;
    }
    else{
        $('#date').val(new Date().toISOString().slice(0, 10));
    }
}

var current;
async function calculateTimes(startDate, cryptocurrency, purchaseAmount, frequency){
    let start;
    let coin;
    let amount;
    let time;

    !startDate ? start = document.forms[0][0].value : start = startDate;
    !frequency ? time=document.forms[0][3].value : time = frequency;
    
    let day;
    let month;
    let year;
    let myDates = []; // dates when you bought
    let myPrices = []; // prices at which you bought
    let accAmounts = []; // accumulated amount
    let date;
    let count=0;
    let cryptoAmount=0;

    start=new Date(start);
    day=start.getDate();
    month=start.getMonth()+1;
    year=start.getFullYear();

    if (month<10){
        month='0'+month;
    }
    if (day<10){
        day='0'+day;
    }

    let firstDate = day+'-'+month+'-'+year;
    myDates.push(firstDate);
    !purchaseAmount ? amount = document.forms[0][2].value*1 : amount = purchaseAmount;
    let today=new Date();
    month=today.getMonth()+1;
    year=today.getFullYear();

    if (month<10){
        month='0'+month;
    }
    day=today.getDate();
    if (today.getDate()<10){
        day='0'+day;
    }

    today = year+'-'+month+'-'+day;
    start=new Date(Date.parse(start));
    start=start.toString();

    localStorage.setItem('startDate', start);
    //localStorage.setItem('cryptocurrency', coin);
    localStorage.setItem('purchaseAmount', amount);
    localStorage.setItem('frequency', time);


    let meantime;
    switch(time){
        case 'day':
            meantime=1*86400000;
            break;
        case 'week':
            meantime=7*86400000;
            break;
        case 'month':
            meantime=30*86400000;
            break;
        case 'quarter':
            meantime=30*4*86400000;
            break;
        case 'year':
            meantime=365*86400000;
            break;
    }
    
    do{
        !cryptocurrency ? coin = document.forms[0][1].value : coin = cryptocurrency;
        localStorage.setItem('cryptocurrency', coin);

        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
        const podatek = await response.json();
        current = podatek[coin].usd;
        
        if (Date.parse(start) == Date.parse(today)){
            !cryptocurrency ? coin = document.forms[0][1].value : coin = cryptocurrency;
            localStorage.setItem('cryptocurrency', coin);

            console.log(coin);

            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
            const podatek = await response.json();
            const price = podatek[coin].usd;
            current = podatek[coin].usd;
            cryptoAmount += amount/podatek[coin].usd;
            myPrices.push(price);
            accAmounts.push(cryptoAmount);
            $('#coinamount').text(cryptoAmount.toFixed(4));
            $('#amount').html(`<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(4)} <span class="coin"></span></div>`);
            $('#currValue').html(`<div class="input-form-group"><span class="title1">Current Value</span><br />${(current*cryptoAmount).toFixed(2)}$</div>`)
            count++;
            if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% up");
                $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
            }
            else{
                $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% down");
                $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
            }
            showResults(count, cryptoAmount, amount);
            let sum = 0;
            for(let i=0; i<myPrices.length; i++){
                sum += myPrices[i]*1;
            }
            drawChart(myDates, myPrices, accAmounts);
            $('#average').text((sum/myPrices.length).toFixed(2));
            $('#averageBuyPrice').html(`<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(sum/myPrices.length).toFixed(2)}$</div>`);
            break;
        }
        else if (Date.parse(start) < Date.parse(today)){
            start=new Date(Date.parse(start));
            month=start.getMonth()+1;
            year=start.getFullYear();
            day=start.getDate();

            if (month<10){
                month='0'+month;
            }
            if (day<10){
                day='0'+day;
            }
            
            start=year+'-'+month+'-'+day;
            count++;
            !cryptocurrency ? coin = document.forms[0][1].value : coin = cryptocurrency;
            localStorage.setItem('cryptocurrency', coin);
            date = day+'-'+month+'-'+start.substr(0,4);
            
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}&localization=false`, {method: 'GET'});
            const podatek = await response.json();
            const price = await podatek.market_data.current_price.usd;
            myPrices.push(price);
            cryptoAmount += amount/podatek.market_data.current_price.usd;
            accAmounts.push(cryptoAmount);
            $('#coinamount').text(cryptoAmount.toFixed(4));
            $('#amount').html(`<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(4)} <span class="coin"></span></div>`);
            $('#currValue').html(`<div class="input-form-group"><span class="title1">Current Value</span><br />${(current*cryptoAmount).toFixed(2)}$</div>`)
            if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% up");
                $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
            }
            else{
                $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% down");
                $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
            }
            let sum = 0;
            for(let i=0; i<myPrices.length; i++){
                sum += myPrices[i]*1;
            }
            drawChart(myDates, myPrices, accAmounts);
            $('#average').text((sum/myPrices.length).toFixed(2));
            $('#averageBuyPrice').html(`<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(sum/myPrices.length).toFixed(2)}$</div>`);
            showResults(count, cryptoAmount, amount);

            if ((Date.parse(today)-Date.parse(start))<meantime) {
                showResults(count, cryptoAmount, amount);
                break;
            }

            switch(time){
                case 'day':
                    start = addMilliseconds(start, 86400000);
                    break;
                case 'week':
                    start = addMilliseconds(start, 86400000*7);
                    break;
                case 'month':
                    start = addOneMonth(start);
                    break;
                case 'quarter':
                    start = addAQuarter(start);
                    break;
                case 'year':
                    start = addMilliseconds(start, 86400000*365);
                    break;
            }
            start=start.toISOString();
            year=start.substring(0, 4);
            month=start.substr(5, 2);
            day=start.substr(8,2);
            date = day+'-'+month+'-'+year;
            myDates.push(date);

            if(Date.parse(start) == Date.parse(today)){
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
                const podatek = await response.json();
                const price = await podatek[coin].usd;
                current = podatek[coin].usd;
                myPrices.push(price);
                cryptoAmount += amount/podatek[coin].usd;
                accAmounts.push(cryptoAmount);
                $('#coinamount').text(cryptoAmount.toFixed(4));
                $('#amount').html(`<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(4)} <span class="coin"></span></div>`);
                $('#currValue').html(`<div class="input-form-group"><span class="title1">Current Value</span><br />${(current*cryptoAmount).toFixed(2)}$</div>`)
                count++;
                if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                    $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% up");
                    $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
                }
                else{
                    $('#profit').text(((current*cryptoAmount)/(count*amount)*100-100).toFixed(2) + "% down");
                    $('#roi').html(`<div class='input-form-group'><span class="title1">ROI</span><br />${((current*cryptoAmount)/(count*amount)*100-100).toFixed(2)}%</div>`);
                }
                let sum = 0;
                for(let i=0; i<myPrices.length; i++){
                    sum += myPrices[i]*1;
                }
                drawChart(myDates, myPrices, accAmounts);
                $('#average').text((sum/myPrices.length).toFixed(2));
                $('#averageBuyPrice').html(`<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(sum/myPrices.length).toFixed(2)}$</div>`);
                showResults(count, cryptoAmount, amount);
                break;
            }
        }
        else{
            showResults(count, cryptoAmount, amount);
            break;
        }
    }
    while (true);
    return false;
}

async function showResults(count, cryptoAmount, amount) {
    if (count==0){
        count = 1;
    }
    $('#times').text(count);
    $('#timesInvested').html(`<div class="input-form-group"><span class="title1">Times Invested</span><br />${count}</div>`);
    $('#total').text(count*amount);
    $('#totalInvested').html(`<div class="input-form-group"><span class="title1">Total Invested</span><br />${count*amount}$</div>`);

    switch (localStorage.getItem('cryptocurrency')){
        case "bitcoin":
            $('.coin').text("$BTC");
            break;
        case "ethereum":
            $('.coin').text("$ETH");
            break;
        case "tether":
            $('.coin').text("$USDT");
            break;
        case "binancecoin":
            $('.coin').text("$BNB");
            break;
        case "ripple":
            $('.coin').text("$XRP");
            break;
        case "cardano":
            $('.coin').text("$ADA");
            break;
        case "dogecoin":
            $('.coin').text("$DOGE");
            break;
        case "solana":
            $('.coin').text("$SOL");
            break;
        case "polkadot":
            $('.coin').text("$DOT");
            break;
    }

    if (current == NaN) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
        const podatek = await response.json();
        current = podatek[coin].usd;
        cryptoAmount += amount/podatek[coin].usd;
        $('#coinamount').text(cryptoAmount.toFixed(4));
        $('#amount').html(`<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(4)} <span class="coin"></span></div>`);
    }

    if (count == 1){
        $('#second').text("I'll keep waiting for my investment to grow.");
        $('#roi').hide();
        $('#timesInvested').hide();
        $('#currValue').hide();
        $('#curve_chart').hide();
        $('#third').hide();
    }
    else{
        $('#roi').show();
        $('#timesInvested').show();
        $('#currValue').show();
        $('#curve_chart').show();
        $('#second').hide();
        $('#third').show();
    }
    let startD = document.forms[0][0].value;
    startD = startD.substr(8,10)+"/"+startD.substring(5,7)+"/"+startD.substr(0, 4);
    $("#startdate").text(startD);
    $('#twitter').html(`<a href="https://twitter.com/share?text=${$('#result').text()}"><img src="icons/twitter.png" data-toggle='tooltip' data-placement='top' title="Tweet"></a>`);
}

const addMilliseconds = (date, milliseconds) => {
    const result = new Date(date);
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
    return result;
};

function share(){
    let copyText = $('#result').text();
    navigator.clipboard.writeText(copyText);
    $("#copy").attr('title','Copied!');
    $('[data-toggle="tooltip"]').tooltip('dispose');
    $('[data-toggle="tooltip"]').tooltip();
    $('#copy').tooltip('show');
}

$(function(){
    $('body').tooltip({selector:'[data-toggle="tooltip"]'});
});

google.charts.load('current', {'packages':['corechart']});
//google.charts.setOnLoadCallback(drawChart);

function drawChart(myDates, myPrices, accAmounts) {

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Value');

    for (var i = 0; i < myDates.length; i++) {
        data.addRow([myDates[i], myPrices[i]*accAmounts[i]]);
    }

    var options = {
        title: 'Portfolio Value',
        titleTextStyle: {
            color: '#d6d2de',
            fontName: 'Space Grotesk',
            fontSize: 18
        },
        backgroundColor: '#242535',
        legend: 'none',
        vAxis: {minValue: 0, viewWindow: {min: 0}},
        hAxis: {
            textStyle: {
                color: '#d6d2de',
                fontName: 'Space Grotesk'},
            fontName: 'Space Grotesk'
        },
        vAxis: {
            textStyle: {
                color: '#d6d2de', 
                fontName: 'Space Grotesk'},
            fontName: 'Space Grotesk'
        },
        curveType: 'function',
        intervals: {'style':'area'},
        lineWidth: 3,
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out',
          },
        chartArea:{width:"80%", height:"80%"}
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));
    chart.draw(data, options);
}

function addOneMonth(start){
    start = new Date(start);
    month = start.getMonth()+2;
    year = start.getFullYear();
    if(month == 13){
        month = 1;
        year = start.getFullYear()+1;
    }
    start = year+'-'+month+'-'+start.getDate();
    start = new Date(start);
    return start;
}

function addAQuarter(start){
    start = new Date(start);
    console.log(start.getMonth()+2);
    month = start.getMonth()+5;
    year = start.getFullYear();
    if(month == 13){
        month = 1;
        year = start.getFullYear()+1;
    }
    if(month == 14){
        month = 2;
        year = start.getFullYear()+1;
    }
    if(month == 15){
        month = 3;
        year = start.getFullYear()+1;
    }
    if(month == 16){
        month = 4;
        year = start.getFullYear()+1;
    }
    start = year+'-'+month+'-'+start.getDate();
    console.log(start);
    start = new Date(start);
    console.log(start);
    return start;
}