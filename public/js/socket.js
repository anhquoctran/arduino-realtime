$(document).ready(function() {
    
    var socket = io.connect();

    var table = $("#tableAccessHistory tr:last");

    socket.on("access", function(card) {
        var cardContext = JSON.parse(card);
        var row = "<tr><td>" + cardContext.cardId + "</td><td>" + cardContext.datePuts + "</td></tr>";
        table.hide()

        $("#tableAccessHistory tr:last-child").after(row);
        row.fadeIn("slow");
    })

    Highcharts.setOptions({
        global: {
            useUTC: false
        }
    })

    Highcharts.chart('lightStateChart', {
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: function () {

                    // set up the updating of the chart each second
                    socket.on('lightValues', function(values) {
                        
                    })
                }
            }
        },
        title: {
            text: 'LED state'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                    Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'State',
            // data: (function () {
            //     // generate an array of random data
            //     var data = [],
            //         time = (new Date()).getTime(),
            //         i;

            //     for (i = -19; i <= 0; i += 1) {
            //         data.push({
            //             x: time + i * 1000,
            //             y: Math.random()
            //         });
            //     }
            //     return data;
            // }())
        }]
    });

})