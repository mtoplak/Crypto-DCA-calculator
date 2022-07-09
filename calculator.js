function calculate(){
    $('#result').html('<h2>I have spent a total of <span id="total"></span>$ on <span id="coinamount"></span> $<span id="coin"></span>. <div id="second"> My total investment is <span id="profit"></span> and I have invested <span id="times"></span> times. My average buy price was <span id="average"></span>$.</div></h2>');
    $('#total').text();

    try{
        calculateTimes();
    }
    catch(err){
        console.log(err);
    }
    
    return false;
}

function load(){
    $('#date').val(new Date().toISOString().slice(0, 10));
}

var current;
async function calculateTimes(){
    let start=document.forms[0][0].value;
    let time=document.forms[0][3].value;

    start=start.toString();
    console.log(start);
    let count=0;
    let cryptoAmount=0;
    let myPrices = [];
    let amount = document.forms[0][2].value*1;
    let today=new Date();
    let month=today.getMonth()+1;
    if (month<10){
        month='0'+month;
    }
    let day=today.getDate();
    if (today.getDate()<10){
        day='0'+day;
    }
    today = today.getFullYear()+'-'+month+'-'+day;
    console.log(today);
    start=new Date(Date.parse(start));
    start=start.toString();
    
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
    ///
    
    do{
        ///
        let coin = document.forms[0][1].value;
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
        const podatek = await response.json();
        console.log(response);
        current = podatek[coin].usd;
        ///
        if (Date.parse(start) == Date.parse(today)){
            let coin = document.forms[0][1].value;
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
            const podatek = await response.json();
            console.log(podatek[coin].usd);
            current = podatek[coin].usd;
            cryptoAmount += amount/podatek[coin].usd;
            myPrices.push(podatek[coin].usd);
            console.log("amount: " + cryptoAmount);
            $('#coinamount').text(cryptoAmount);
            count++;
            if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% up");
            }
            else{
                $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% down");
            }
            showResults(count, cryptoAmount, myPrices);
            let sum = 0;
            for(let i=0; i<myPrices.length; i++){
                sum += myPrices[i]*1;
            }
            console.log("sum: " + sum + " length: " + myPrices.length);
            console.log(myPrices);
            $('#average').text(sum/myPrices.length);
            break;
        }
        else if (Date.parse(start) < Date.parse(today)){
            console.log("calculating...");
            start=new Date(Date.parse(start));
            console.log("start date: " + start);
            
            
            mesec=start.getMonth()+1;
            year=start.getFullYear();
            day=start.getDate();

            if (mesec<10){
                mesec='0'+mesec;
            }
            if (day<10){
                day='0'+day;
            }
            
            start=year+'-'+mesec+'-'+day;
            console.log(start);
            count++;
            let coin = document.forms[0][1].value;
            let date = day+'-'+mesec+'-'+start.substr(0,4);
            
            console.log(date);
            fetch(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}&localization=false`, {method: 'GET'})
            .then((data) => { return data.json();})
            .then((podatek) => {
                console.log(podatek);
                console.log(podatek.market_data.current_price.usd);
                cryptoAmount += amount/podatek.market_data.current_price.usd;
                myPrices.push(podatek.market_data.current_price.usd);
                console.log("amount: " + cryptoAmount);
                $('#coinamount').text(cryptoAmount);
                if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                    $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% up");
                }
                else{
                    $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% down");
                }
                let sum = 0;
                for(let i=0; i<myPrices.length; i++){
                    sum += myPrices[i]*1;
                }
                console.log("sum: " + sum + " length: " + myPrices.length);
                console.log(myPrices);
                $('#average').text(sum/myPrices.length);
            });

            if ((Date.parse(today)-Date.parse(start))<meantime) {
                showResults(count, cryptoAmount, myPrices);
                break;
            }

            //
            switch(time){
                case 'day':
                    start = addMilliseconds(start, 86400000);
                    break;
                case 'week':
                    start = addMilliseconds(start, 86400000*7);
                    break;
                case 'month':
                    start = addMilliseconds(start, 86400000*30);
                    break;
                case 'quarter':
                    start = addMilliseconds(start, 86400000*30*4);
                    break;
                case 'year':
                    start = addMilliseconds(start, 86400000*365);
                    break;
            }

            console.log("new start date: " + start);

            if(Date.parse(start) == Date.parse(today)){
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
                const podatek = await response.json();
                console.log(podatek[coin].usd);
                current = podatek[coin].usd;
                cryptoAmount += amount/podatek[coin].usd;
                console.log("amount: " + cryptoAmount);
                myPrices.push(podatek[coin].usd);
                $('#coinamount').text(cryptoAmount);
                count++;
                if (((current*cryptoAmount)/(count*amount)*100-100)>0){
                    $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% up");
                }
                else{
                    $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% down");
                }
                let sum = 0;
                for(let i=0; i<myPrices.length; i++){
                    sum += myPrices[i]*1;
                }
                console.log("sum: " + sum + " length: " + myPrices.length);
                console.log(myPrices);
                $('#average').text(sum/myPrices.length);
                showResults(count, cryptoAmount, myPrices);
                break;
            } 
        }
        else{
            showResults(count, cryptoAmount);
            break;
        }
    }
    while (true);
    return false;
}

async function showResults(count, cryptoAmount, myPrices) {
    if (count==0){
        count = 1;
    }
    let amount=document.forms[0][2].value;
    $('#times').text(count);
    $('#total').text(count*amount);
    $('#coin').text(document.forms[0][1].value);

    if (current == NaN) {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`, {method: 'GET'});
        const podatek = await response.json();
        console.log(podatek[coin].usd);
        current = podatek[coin].usd;
        cryptoAmount += amount/podatek[coin].usd;
        console.log("amount: " + cryptoAmount);
        $('#coinamount').text(cryptoAmount);
    }
    console.log("current: " + current+ " amount: " + cryptoAmount + " amount: " +count*amount);
    console.log("before "+current*cryptoAmount+" after: "+count*amount);
    console.log(current);
    console.log(current*$('#coinamount').text());
    
    /*
    if (((current*cryptoAmount)/(count*amount)*100-100)>0){
        $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% up");
    }
    else{
        $('#profit').text((current*cryptoAmount)/(count*amount)*100-100 + "% down");
    }*/

    if (count == 1){
        $('#second').text("I'll keep waiting for my investment to grow.");
    }
}

const addMilliseconds = (date, milliseconds) => {
    const result = new Date(date);
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
    return result;
};