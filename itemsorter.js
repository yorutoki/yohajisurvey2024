waitforready = setInterval(()=>{
    if (siteready) {
        doSort()
        clearInterval(waitforready)
    }
}, 100)

function doSort() {
    console.log('ready!')
    // operate on each ".sorting-group", in case there's multiple on one page
    $('.sorting-group').each(function () {

        // if there isn't a "data-filter=all" button, add a hidden one before the first sorting button. code breaks if there isn't one
        if (!$(this).find('[data-filter=all]').length) {
            $(this).find('.sorting-button').first().before('<div class="sorting-button" data-filter="all" style="display:none"></div>');
        }

        const
            thisgroup = $(this),
            sortbtn = thisgroup.find('.sorting-button'),
            sortall = thisgroup.find('[data-filter=all]'),
            container = thisgroup.find('.sorting-container'),
            item = thisgroup.find('.sorting-item');


        //showing the tags on each item for debugging
        item.each(function () {
            const itemtags = $(this).attr('data-item').split(' ');
            itemtagsappend = '<div class="itemtagsgroup">';
            for (const x of itemtags) {
                itemtagsappend += '<div class="itemtags">' + x + '</div>';
            }
            itemtagsappend += '</div>';
            $(this).append(itemtagsappend);
        });


        // rearrange items in HTML DOM (not just visually sorting it with flexbox) so Media Viewer shows images in the right order
        const dates = [];
        item.each(function () {
            if (!($(this).attr('data-order'))) {
                $(this).attr('data-order', $(this).index());
            }
            dates.push($(this).attr('data-order'));
        })
        dates.sort(function (a, b) { return a - b });

        const itemslist = [];
        for (const i of dates) {
            itemslist.push(thisgroup.find('[data-order=' + i + ']'));
        }

        container.html(itemslist);

        container.after('<div class="sorting-hidden" style="display:none"></div>')

        // make "all" button active by default        
        sortall.addClass('active');

        sortbtn.click(function () {

            container.html(itemslist);

            // if the button-group has the class "sortone", make it allow only 1 filter. by default this does a AND filter. 
            if ($(this).closest('.button-group').attr('class').includes('sortone')) {
                $(this).siblings().removeClass('active');
            }

            $(this).toggleClass('active');
            sortall.removeClass('active');

            // if the button clicked is "all", or if there's no sorting button active, make the "all" button active (and show all items)
            if ($(this).attr('data-filter') == 'all' || sortbtn.filter('.active').length < 1) {
                sortbtn.removeClass('active');
                sortall.addClass('active');
            }

            const filter = [];

            // find every sorting button that's active, and get its "data-filter" and add it to an array
            sortbtn.filter('.active').each(function () {
                filter.push($(this).attr('data-filter'));
            });

            // if the active button is "all", empty the array so it's not filtering for anything
            if (sortall.is('.active') || sortbtn.filter('.active').length < 1) {
                filter.length = 0;
            }

            thisgroup.find('#currentfilter').text(filter); //debugging

            item.each(function () {

                //make an array out of the "data-item"s on an item
                const itemtags = $(this).attr('data-item').split(' ');

                $(this).removeClass('active');
                $(this).addClass('hide');

                // see if the item tags contain every string in the filter
                if (filter.every(x => itemtags.includes(x))) {
                    $(this).removeClass('hide');
                    $(this).addClass('active');
                }

                if ($(this).is('.hide')) {
                    $(this).appendTo(thisgroup.find('.sorting-hidden'));
                }

            });

            itemCount();

            $('.itemtags').click(function() {
                console.log(this)
                $('.button-group').find('[data-filter=' + $(this).text() + ']').click()
            });

        }); //end sortbtn onclick

        // --------------- sort by newest/oldest buttons
        // this relies on the items each having a [data-order="(number)"]
        // if it doesnt have a data-order, the DOM order is added as the data-order (first one is 0, second is 1, etc etc)

        if (thisgroup.find('.sortby').length) {

            const
                newestbtn = thisgroup.find('[data-sortby=newest]'),
                orderbtn = thisgroup.find('.sortby');

            if (thisgroup.is('.sortbynewest')) {
                newestbtn.addClass('active');
                reverseOrder();
            } else {
                thisgroup.find('[data-sortby=oldest]').addClass('active');
            }

            orderbtn.click(function () {
                orderbtn.toggleClass('active');
                reverseOrder();
            });

            function reverseOrder() {
                itemslist.reverse();
                container.html(itemslist);
                item.each(function () {
                    if ($(this).is('.hide')) {
                        $(this).appendTo(thisgroup.find('.sorting-hidden'));
                    }
                });
            }
        }

        // ----------------------- end sort by newest/oldest

        // -------- adding a search bar

        // add an element with [id="search-something"]
        // replace "something" with the html attribute to look for
        // this will add an inputbox to search and filter that attribute
        // do "search-text" to search the text content of the items

        // adding the search query behind a hash # will autofill it into the searchbar
        // i.e. "Page#Example" will fill in "Example" in the searchbar

        if (thisgroup.find('[id^=search-]').length) {
            const
                searchWrapper = thisgroup.find('[id^=search-]:visible').eq(0),
                searchFor = searchWrapper.attr('id').slice(7),
                searchPlaceholder = searchWrapper.html();

            searchWrapper.html(`<input name="${searchFor}" placeholder="${searchPlaceholder}" />`);

            const query = (new URL(window.location.href)).hash.slice(1);
            searchWrapper.find('input').val(query);

            $(searchbox);

            searchWrapper.find('input').on('keyup', searchbox);

            function searchbox() {
                const input = searchWrapper.find('input').val().toLowerCase();
                item.filter((index, element) => {
                    if (searchFor == 'text') {
                        $(element).toggle($(element).text().toLowerCase().includes(input))
                    } else {
                        $(element).toggle($(element).attr(`${searchFor}`).includes(input))
                    }
                });
                itemCount();
            }
        }
        // ------------------------- search bar end

        itemCount();

        function itemCount() { thisgroup.find('#itemcount').text(thisgroup.find('.sorting-item:visible').length); } //debugging

        $('.itemtags').click(function() {
            console.log(this)
            $('.button-group').find('[data-filter=' + $(this).text() + ']').click()
        });
        

    }); // end sorting-group each()
}