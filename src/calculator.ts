function calculate(
    startDate?: string,
    cryptocurrency?: string,
    purchaseAmount?: number,
    frequency?: string
): boolean {
    $("#result").html(
        '<h3>I have spent a total of <span id="total" class="strong"></span>$ on <span id="coinamount" class="strong"></span> <span class="coin strong"></span> since <span id="startdate" class="strong"></span>. <div id="second"></div> <div id="third"> My total investment is <span id="profit" class="strong"></span> and I have invested <span id="times" class="strong"></span> times. My average buy price was <span id="average" class="strong"></span>$.</div></h3>'
    );
    $("#share-button").html(
        `Share the results: <button id='copy' data-toggle='tooltip' data-placement='top' title='Copy' onclick='share();'><img src='icons/copy.png'></button>`
    );
    try {
        if (!startDate) {
            calculateTimes();
        } else {
            calculateTimes(startDate, cryptocurrency, purchaseAmount, frequency);
        }
    } catch (err) {
        console.log(err);
    }

    return false;
}

function load(): void {
    $('#twitter').hide();
    if (localStorage.getItem("startDate") != null) {
        let startDate: any = localStorage.getItem("startDate");
        let cryptocurrency: string = localStorage.getItem("cryptocurrency")!;
        let purchaseAmount: number = +localStorage.getItem("purchaseAmount")!;
        let frequency: string = localStorage.getItem("frequency")!;
        calculate(startDate, cryptocurrency, purchaseAmount, frequency);
        startDate = Date.parse(startDate);
        startDate = new Date(startDate);
        startDate = startDate.toISOString();
        (<HTMLInputElement>document.forms[0][0]).value = startDate.slice(0, 10);
        (<HTMLInputElement>document.forms[0][1]).value = cryptocurrency;
        (<HTMLInputElement>document.forms[0][2]).value =
            purchaseAmount as unknown as string;
        (<HTMLInputElement>document.forms[0][3]).value = frequency;
    } else {
        $("#date").val(new Date().toISOString().slice(0, 10));
    }
}

var current: number;
async function calculateTimes(
    startDate?: string,
    cryptocurrency?: string,
    purchaseAmount?: number,
    frequency?: string
): Promise<void> {
    let start: any;
    let coin: string;
    let amount: any;
    let time: string;
    $('#twitter').show();

    !startDate
        ? (start = (<HTMLInputElement>document.forms[0][0]).value)
        : (start = startDate);
    !frequency
        ? (time = (<HTMLInputElement>document.forms[0][3]).value)
        : (time = frequency);

    let day: number | string;
    let month: number | string;
    let year: number;
    let myDates: string[] | string = []; // dates when you bought
    let myPrices: number[] | number = []; // prices at which you bought
    let accAmounts: number[] | number = []; // accumulated amount
    let date: string;
    let count: number = 0;
    let cryptoAmount: number = 0;

    start = new Date(start);
    day = start.getDate();
    month = start.getMonth() + 1;
    year = start.getFullYear();

    if (month < 10) {
        month = "0" + month;
    }
    if (day < 10) {
        day = "0" + day;
    }

    let firstDate: string = day + "-" + month + "-" + year;
    myDates.push(firstDate);
    !purchaseAmount
        ? (amount = (document.forms[0][2] as HTMLInputElement).value)
        : (amount = purchaseAmount);
    let today: any = new Date();
    month = today.getMonth() + 1;
    year = today.getFullYear();

    if (month < 10) {
        month = "0" + month;
    }
    day = today.getDate();
    if (today.getDate() < 10) {
        day = "0" + day;
    }

    today = year + "-" + month + "-" + day;
    start = new Date(Date.parse(start));
    start = start.toString();

    localStorage.setItem("startDate", start);
    //localStorage.setItem('cryptocurrency', coin);
    localStorage.setItem("purchaseAmount", amount);
    localStorage.setItem("frequency", time);

    let meantime: number;
    switch (time) {
        case "day":
            meantime = 1 * 86400000;
            break;
        case "week":
            meantime = 7 * 86400000;
            break;
        case "month":
            meantime = 30 * 86400000;
            break;
        case "quarter":
            meantime = 30 * 4 * 86400000;
            break;
        case "year":
            meantime = 365 * 86400000;
            break;
    }

    do {
        !cryptocurrency
            ? (coin = (<HTMLInputElement>document.forms[0][1]).value)
            : (coin = cryptocurrency);
        localStorage.setItem("cryptocurrency", coin);

        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
            { method: "GET" }
        );
        const data = await response.json();
        current = data[coin].usd;

        if (Date.parse(start) == Date.parse(today)) {
            !cryptocurrency
                ? (coin = (<HTMLInputElement>document.forms[0][1]).value)
                : (coin = cryptocurrency);
            localStorage.setItem("cryptocurrency", coin);

            if (Date.parse(start) == Date.parse(today) && count == 0) {
                $('#third').remove();
            }

            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
                { method: "GET" }
            );
            const data = await response.json();
            const price = data[coin].usd;
            current = data[coin].usd;
            cryptoAmount += amount / data[coin].usd;
            myPrices.push(price);
            accAmounts.push(cryptoAmount);
            $("#coinamount").text(cryptoAmount.toFixed(4));
            $("#amount").html(
                `<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(
                    4
                )} <span class="coin"></span></div>`
            );
            $("#currValue").html(
                `<div class="input-form-group"><span class="title1">Current Value</span><br />${(
                    current * cryptoAmount
                ).toFixed(2)}$</div>`
            );
            count++;
            if (((current * cryptoAmount) / (count * amount)) * 100 - 100 > 0) {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% up"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            } else {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% down"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            }
            showResults(count, cryptoAmount, amount, coin);
            let sum: number = 0;
            for (let i = 0; i < myPrices.length; i++) {
                sum += myPrices[i] * 1;
            }
            drawChart(myDates, myPrices, accAmounts);
            $("#average").text((sum / myPrices.length).toFixed(2));
            $("#averageBuyPrice").html(
                `<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(
                    sum / myPrices.length
                ).toFixed(2)}$</div>`
            );
            break;
        } else if (Date.parse(start) < Date.parse(today)) {
            start = new Date(Date.parse(start));
            month = start.getMonth() + 1;
            year = start.getFullYear();
            day = start.getDate();

            if (month < 10) {
                month = "0" + month;
            }
            if (day < 10) {
                day = "0" + day;
            }

            start = year + "-" + month + "-" + day;
            count++;
            !cryptocurrency
                ? (coin = (<HTMLInputElement>document.forms[0][1]).value)
                : (coin = cryptocurrency);
            localStorage.setItem("cryptocurrency", coin);
            date = day + "-" + month + "-" + start.substr(0, 4);

            const response = await fetch(
                `https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}&localization=false`,
                { method: "GET" }
            );
            const data = await response.json();
            const price = await data.market_data.current_price.usd;
            myPrices.push(price);
            cryptoAmount += amount / data.market_data.current_price.usd;
            accAmounts.push(cryptoAmount);
            $("#coinamount").text(cryptoAmount.toFixed(4));
            $("#amount").html(
                `<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(
                    4
                )} <span class="coin"></span></div>`
            );
            $("#currValue").html(
                `<div class="input-form-group"><span class="title1">Current Value</span><br />${(
                    current * cryptoAmount
                ).toFixed(2)}$</div>`
            );
            if (((current * cryptoAmount) / (count * amount)) * 100 - 100 > 0) {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% up"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            } else {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% down"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            }
            let sum: number = 0;
            for (let i = 0; i < myPrices.length; i++) {
                sum += myPrices[i] * 1;
            }
            drawChart(myDates, myPrices, accAmounts);
            $("#average").text((sum / myPrices.length).toFixed(2));
            $("#averageBuyPrice").html(
                `<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(
                    sum / myPrices.length
                ).toFixed(2)}$</div>`
            );
            showResults(count, cryptoAmount, amount, coin);

            if (Date.parse(today) - Date.parse(start) < meantime!) {
                showResults(count, cryptoAmount, amount, coin);
                break;
            }

            switch (time) {
                case "day":
                    start = addMilliseconds(start, 86400000);
                    break;
                case "week":
                    start = addMilliseconds(start, 86400000 * 7);
                    break;
                case "month":
                    start = addOneMonth(start);
                    break;
                case "quarter":
                    start = addAQuarter(start);
                    break;
                case "year":
                    start = addMilliseconds(start, 86400000 * 365);
                    break;
            }
            start = new Date(start + "Z").toISOString();
            year = start.substring(0, 4);
            month = start.substr(5, 2);
            day = start.substr(8, 2);
            date = day + "-" + month + "-" + year;
            myDates.push(date);

            if (Date.parse(start) == Date.parse(today)) {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
                    { method: "GET" }
                );
                const data = await response.json();
                const price = await data[coin].usd;
                current = data[coin].usd;
                myPrices.push(price);
                cryptoAmount += amount / data[coin].usd;
                accAmounts.push(cryptoAmount);
                $("#coinamount").text(cryptoAmount.toFixed(4));
                $("#amount").html(
                    `<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(
                        4
                    )} <span class="coin"></span></div>`
                );
                $("#currValue").html(
                    `<div class="input-form-group"><span class="title1">Current Value</span><br />${(
                        current * cryptoAmount
                    ).toFixed(2)}$</div>`
                );
                count++;
                if (((current * cryptoAmount) / (count * amount)) * 100 - 100 > 0) {
                    $("#profit").text(
                        (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                            2
                        ) + "% up"
                    );
                    $("#roi").html(
                        `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                            ((current * cryptoAmount) / (count * amount)) * 100 -
                            100
                        ).toFixed(2)}%</div>`
                    );
                } else {
                    $("#profit").text(
                        (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                            2
                        ) + "% down"
                    );
                    $("#roi").html(
                        `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                            ((current * cryptoAmount) / (count * amount)) * 100 -
                            100
                        ).toFixed(2)}%</div>`
                    );
                }
                let sum: number = 0;
                for (let i = 0; i < myPrices.length; i++) {
                    sum += myPrices[i] * 1;
                }
                drawChart(myDates, myPrices, accAmounts);
                $("#average").text((sum / myPrices.length).toFixed(2));
                $("#averageBuyPrice").html(
                    `<div class='input-form-group'><span class="title1">Average Buy Price</span><br />${(
                        sum / myPrices.length
                    ).toFixed(2)}$</div>`
                );
                showResults(count, cryptoAmount, amount, coin);
                break;
            }
        } else {
            const response = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
                { method: "GET" }
            );
            const data = await response.json();
            const price = await data[coin].usd;
            current = data[coin].usd;
            myPrices.push(price);
            cryptoAmount += amount / data[coin].usd;
            accAmounts.push(cryptoAmount);
            count++;
            $("#coinamount").text(cryptoAmount.toFixed(4));
            $("#amount").html(
                `<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(
                    4
                )} <span class="coin"></span></div>`
            );
            $("#currValue").html(
                `<div class="input-form-group"><span class="title1">Current Value</span><br />${(
                    current * cryptoAmount
                ).toFixed(2)}$</div>`
            );
            if (((current * cryptoAmount) / (count * amount)) * 100 - 100 > 0) {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% up"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            } else {
                $("#profit").text(
                    (((current * cryptoAmount) / (count * amount)) * 100 - 100).toFixed(
                        2
                    ) + "% down"
                );
                $("#roi").html(
                    `<div class='input-form-group'><span class="title1">ROI</span><br />${(
                        ((current * cryptoAmount) / (count * amount)) * 100 -
                        100
                    ).toFixed(2)}%</div>`
                );
            }
            showResults(count, cryptoAmount, amount, coin);
            drawChart(myDates, myPrices, accAmounts);
            break;
        }
    } while (true);
    //return false; function returns a promise!
}

async function showResults(
    count: number,
    cryptoAmount: number,
    amount: number,
    coin: string
): Promise<void> {
    if (count == 0) {
        count = 1;
    }
    $("#times").text(count);
    $("#timesInvested").html(
        `<div class="input-form-group"><span class="title1">Times Invested</span><br />${count}</div>`
    );
    $("#total").text(count * amount);
    $("#totalInvested").html(
        `<div class="input-form-group"><span class="title1">Total Invested</span><br />${count * amount
        }$</div>`
    );

    switch (localStorage.getItem("cryptocurrency")) {
        case "bitcoin":
            $(".coin").text("$BTC");
            break;
        case "ethereum":
            $(".coin").text("$ETH");
            break;
        case "tether":
            $(".coin").text("$USDT");
            break;
        case "binancecoin":
            $(".coin").text("$BNB");
            break;
        case "ripple":
            $(".coin").text("$XRP");
            break;
        case "cardano":
            $(".coin").text("$ADA");
            break;
        case "dogecoin":
            $(".coin").text("$DOGE");
            break;
        case "solana":
            $(".coin").text("$SOL");
            break;
        case "polkadot":
            $(".coin").text("$DOT");
            break;
    }

    if (current == NaN) {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`,
            { method: "GET" }
        );
        const data = await response.json();
        current = data[coin].usd;
        cryptoAmount += amount / data[coin].usd;
        $("#coinamount").text(cryptoAmount.toFixed(4));
        $("#amount").html(
            `<div class="input-form-group"><span class="title1">Amount Acquired</span><br />${cryptoAmount.toFixed(
                4
            )} <span class="coin"></span></div>`
        );
    }

    if (count != 1){
        $('#second').remove();
        $("#roi").show();
        $("#timesInvested").show();
        $("#currValue").show();
        $("#curve_chart").show();
        $("#third").show();
    } else {
        $("#second").text("I'll keep waiting for my investment to grow.");
        $("#roi").hide();
        $("#timesInvested").hide();
        $("#currValue").hide();
        $("#curve_chart").hide();
    }

    let startD = (<HTMLInputElement>document.forms[0][0]).value;
    startD =
        startD.substr(8, 10) +
        "/" +
        startD.substring(5, 7) +
        "/" +
        startD.substr(0, 4);
    $("#startdate").text(startD);
    let text = $('#result').text();
    /*$("#twitter").html(
        `<a class="twitter-share-button" href="https://twitter.com/intent/tweet" data-size="large" data-related="twitterapi,twitter" data-text="${text}"></a>`
    );*/
}

const addMilliseconds = (date: any, milliseconds: number) => {
    const result = new Date(date);
    result.setMilliseconds(result.getMilliseconds() + milliseconds);
    return result;
};

function share(): void {
    let copyText = $("#result").text();
    navigator.clipboard.writeText(copyText);
    $("#copy").attr("title", "Copied!");
    $('[data-toggle="tooltip"]').tooltip("dispose");
    $('[data-toggle="tooltip"]').tooltip();
    $("#copy").tooltip("show");
}

$(function () {
    $("body").tooltip({ selector: '[data-toggle="tooltip"]' });
});

google.charts.load("current", { packages: ["corechart"] });
//google.charts.setOnLoadCallback(drawChart);

function drawChart(
    myDates: string[],
    myPrices: number[],
    accAmounts: number[]
): void {
    var data = new google.visualization.DataTable();
    data.addColumn("string", "Date");
    data.addColumn("number", "Value");

    for (var i = 0; i < myDates.length; i++) {
        data.addRow([myDates[i], myPrices[i] * accAmounts[i]]);
    }

    var options: string | number | object = {
        title: "Portfolio Value",
        titleTextStyle: {
            color: "#d6d2de",
            fontName: "Space Grotesk",
            fontSize: 18,
        },
        backgroundColor: "#242535",
        legend: "none",
        hAxis: {
            textStyle: {
                color: "#d6d2de",
                fontName: "Space Grotesk",
            },
            fontName: "Space Grotesk",
        },
        vAxis: {
            minValue: 0,
            viewWindow: { min: 0 },
            textStyle: {
                color: "#d6d2de",
                fontName: "Space Grotesk",
            },
            fontName: "Space Grotesk",
        },
        curveType: "function",
        intervals: { style: "area" },
        lineWidth: 3,
        animation: {
            startup: true,
            duration: 1000,
            easing: "out",
        },
        chartArea: { width: "80%", height: "80%" },
    };

    var chart = new google.visualization.LineChart(
        document.getElementById("curve_chart")!
    );
    chart.draw(data, options);
}

function addOneMonth(start: any): Date {
    start = new Date(start);
    let month: number = start.getMonth() + 2;
    let year: number = start.getFullYear();
    if (month == 13) {
        month = 1;
        year = start.getFullYear() + 1;
    }
    start = year + "-" + month + "-" + start.getDate();
    start = new Date(start);
    return start;
}

function addAQuarter(start: any): Date {
    start = new Date(start);
    let month: number = start.getMonth() + 5;
    let year: number = start.getFullYear();
    if (month == 13) {
        month = 1;
        year = start.getFullYear() + 1;
    }
    if (month == 14) {
        month = 2;
        year = start.getFullYear() + 1;
    }
    if (month == 15) {
        month = 3;
        year = start.getFullYear() + 1;
    }
    if (month == 16) {
        month = 4;
        year = start.getFullYear() + 1;
    }
    start = year + "-" + month + "-" + start.getDate();
    start = new Date(start);
    return start;
}
