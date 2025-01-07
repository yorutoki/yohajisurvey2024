fetch("data/data.tsv")
  .then((res) => res.text())
  .then((text) => {
    
    data = text.split(/\r*\n/).map(a=>a.split('\t'))

    if ($('body').is('#main')) {
        makeChart(getCounts(1), data[0][1], 'comesfrom', 'doughnut', ['#17b7f2', '#131462', '#7a5ecd'])
        makeChart(getCounts(2), data[0][2], 'whichone', 'doughnut')
        makeChart(getCounts(15), data[0][3], 'when', 'doughnut')
        makeChart(getCounts(16, true), data[0][4], 'why', 'bar')
        makeChart(getCounts(17, true), data[0][4], 'why-character', 'bar')
        makeChart(getCounts(18, true), data[0][4], 'ogfavs', 'bar')
        makeChart(getCounts(20, true), data[0][4], 'dynamics', 'bar')

        characterChart()

        returnanswerer = getCounts(10)[1][1]
        whichone = getCounts(2)

        $('#totalnum').text(data.length - 1);
        $('#returning').text(returnanswerer)
        $('#which1').text(whichone[1][1])
        $('#which2').text(whichone[1][2])

        $('.hide-handle').click(function(){
            $(this).closest('.textsection').toggleClass('hidden')
        })

        if (window.innerWidth > 600) {

            if ($(document).scrollTop() > window.innerHeight) {
                $('#navigation').fadeIn()
            }

            $(window).scroll(function(){
                if ($(document).scrollTop() > window.innerHeight) {
                    $('#navigation').fadeIn()
                } else {
                    $('#navigation').fadeOut()
                }
            })
        }

        $('#aboutlink').click(function(){
            $('#about').fadeIn()
        })
        $('.modal-bg').click(function(){
            $('#about').fadeOut()
            $('.fortuneslip').remove()
        })

        $('#omikuji').click(function(){
            omikuji = Random(1,5) 
            fortune = $('<div>')
            .addClass('modal fortuneslip')
            .prepend('<div class="modal-bg">')
            .append('<img class="fortuneimg" src="images/fortune' + omikuji + '.png">')
            $('body').append(fortune)
            $('.modal-bg').click(function(){
                $('.fortuneslip').remove()
            })
        })

    }

    if ($('body').is('#nicemessages')) {
        msgs = getCounts(11)
        msgs[0].forEach((text)=>{
            entry = $('<div>').addClass('message').html(text)
            $('#messages-container').append(entry)
        })
    }

    if ($('body').is('#talkabtfavs')) {

        $('.drawer-handle').click(function(){
            $(this).closest('.button-group').toggleClass('hide')
            $(this).prev().slideToggle()
        })

        chars = getCounts(14,true)
        chars[0].forEach((name,index)=>{
            charbutton = $('<div>')
            .addClass('sorting-button')
            .attr('data-filter', name)
            .attr('data-num', chars[1][index])
            .html(`<span>${name}</span>`)
            $('.button-group .buttons').append(charbutton)
        })

        yap = [[],[]]

        for (let h=1; h<data.length;h++) {
            if (data[h][8].length > 0) {
                yap[0].push(data[h][8])
                yap[1].push(data[h][14].split(', ').join(' '))
            }
        }

        yap[0].forEach((msg,index)=>{
            yapmsg = $('<div>')
            .addClass('message sorting-item')
            .attr('data-item', yap[1][index])
            .html(msg)
            $('#yap-container').append(yapmsg)
        })


    }

    siteready = true

  })
/*
                yapping = $('<div>').addClass('message').attr('data-item', tags).html(msg)

                $('#yap-container').append(yapping)

*/


function makeChart(data, title, element, type = 'bar', colors) {

    if (colors) {
        barColors = colors
    } else {
        barColors = [
            "#3366cc",
            "#dc3912",
            "#ff9900",
            "#109618",
            "#990099"
        ];
    }

    isBar = (type == 'bar')

    Chart.defaults.color = "#ffffff";

    new Chart(element, {

        type: type,
        data: {
            labels: data[0],
            datasets: [{
                label: '',
                backgroundColor: barColors,
                borderWidth: 0,
                data: data[1],
                hoverOffset: 15
            }]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: false,
                    text: title,
                },
                legend: {
                    labels: {
                        ...(isBar ? { generateLabels: () => [] } : {}),
                        color: "#ffffff"
                    }
                }
            }
        }
    });
}

function getCounts(col, split = false) {
    curcounter = new Map([]);

    for (let i = 1; i < data.length; i++) {
        cur = data[i][col];
        if (cur == "") {
            continue;
        }

        if (split) {
            char = cur.split(", ");
            char.forEach((x) => {
                addOne(curcounter, x);
            });
            continue;
        }
        addOne(curcounter, cur);
    }

    curnames = [];
    curvalues = [];

    curcounter.forEach((value, key) => {
        if (col == 20) {
            if (value > 1) {
                curnames.push(key);
            }
        } else {
        curnames.push(key);
        }
    });

    curnames.sort((a, b) => {
        return curcounter.get(b) - curcounter.get(a);
    });

    if (col == 15) {
        curnames = [
            "Post anime release (Oct 2024 - now)",
            "Post anime announcement (Dec 2023 - Oct 2024)",
            "2024, irrelevant to anime announcement",
            "2023",
            "2022",
            "2021",
            "2020",
            "2019",
            "2018",
            "2017",
        ];
    }

    curnames.forEach((a) => {
        curvalues.push(curcounter.get(a));
    });

    curdata = [curnames, curvalues];
    return curdata;
}

function addOne(map, name) {
    if (!map.get(name)) {
        map.set(name, 0);
    }
    map.set(name, map.get(name) + 1);
}

function characterChart() {
    top1 = getCounts(12);
    top3 = getCounts(13, true);

    newtop3 = [[], []];

    top1[0].forEach((val) => {
        newtop3[0].push(val);
        index = top3[0].indexOf(val);
        if (index > -1) {
            newtop3[1].push(top3[1][index]);
            top3[1].splice(index, 1);
        } else {
            newtop3[1].push(0);
        }
        top3[0].splice(index, 1);
    });

    top3[0].forEach((val, index) => {
        newtop3[0].push(val);
        newtop3[1].push(top3[1][index]);
    });

    Chart.defaults.color = "#ffffff";

    new Chart("top4fav", {
        type: "bar",
        data: {
            labels: newtop3[0],
            datasets: [
                {
                    label: "No. 1 fav",
                    backgroundColor: "#dd4477",
                    borderWidth: 0,
                    data: top1[1],
                    hoverOffset: 15,
                },
                {
                    data: newtop3[1],
                    label: "Other 3 faves",
                    backgroundColor: "#816ff7",
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: "y",
            plugins: {
                title: {
                    display: false,
                },
                legend: {
                    labels: {
                        color: "#ffffff",
                    },
                },
            },
        },
    });
}

function Random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }