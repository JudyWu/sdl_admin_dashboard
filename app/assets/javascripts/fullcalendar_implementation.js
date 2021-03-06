/**
/**
 * Created by Faisal on 1/12/2015.
 */

var metric_colors = {
    'active_time_in_seconds': "#FFAC46",
    'time_not_at_home_in_seconds': "#46D1FF",
    'max_gait_speed_in_meter_per_second': "#6EEDA5"
};

var  metric_class_names = {
    'active_time_in_seconds': "active_time_in_seconds_bar",
    'time_not_at_home_in_seconds': "time_not_at_home_in_seconds_bar",
    'max_gait_speed_in_meter_per_second': "max_gait_speed_in_meter_per_second_bar"
};

// utility function for updating each day cell with a visualization of the three quantities
function bindDay(today, ranges, target) {
    if (today == null) {
        target.empty();
        return;
    }

    // create an svg in the target
    /*
    var width = 100; var height = 50;
    var chart = d3.select(target).attr("viewBox", "0 0 " + width + " " + height);

    var y = d3.scale.linear()
        .domain([0, d3.max(data)])
        .range([0, height]);

    var data = Object.keys(today).map(function(k) { return today[k]; });

    var bar = chart.selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

    bar.append("rect")
        .attr("width", x)
        .attr("height", barHeight - 1);

    bar.append("text")
        .attr("x", function(d) { return x(d) - 3; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d) { return d; });
    */

    // create three bars, scaling each of their heights to the max for that metric
    var i = 0;
    $.each(today, function(k,v) {
        var $bar = $("<div />")
            .css({
                position: 'absolute',
                left: (i/3 * 100 + 1) + "%", bottom: 0,
                width: "32%", height: (v/ranges[k] * 100) + "%",
                background: metric_colors[k]
            })
            .appendTo(target);

        $bar.addClass(metric_class_names[k]);

        // add a label to the bar
        $("<div />")
            .addClass('bar_label')
            .css({
                position: 'absolute',
                textAlign: 'center',
                fontSize: '13px',
                top: ((v/ranges[k]*100) > 30)?'0px':'-16px', left: 0, right: 0
            })
            .text(v)
            .appendTo($bar);

        i += 1;
    });


    // $("<div />").append($("<b />").text("time_not_at_home_in_seconds: ")).append($("<span />").text(today['time_not_at_home_in_seconds']))
    //     .appendTo(target);
    // $("<div />").append($("<b />").text("max_gait_speed_in_meter_per_second: ")).append($("<span />").text(today['max_gait_speed_in_meter_per_second']))
    //     .appendTo(target);
    // $("<div />").append($("<b />").text("active_time_in_seconds: ")).append($("<span />").text(today['active_time_in_seconds']))
    //     .appendTo(target);

}

$(document).ready(function() {
    var my_daily_data = null;
    var ranges = null;
    var metrics = ['max_gait_speed_in_meter_per_second', 'active_time_in_seconds','time_not_at_home_in_seconds'];
    ///Get data for daily mobility variables
    var calendar_data = $('#calendar_data_points').data('url');

    /// Get one day data
    var one_day_pam_data = $('#one_day_pam_data').data('url');
    var one_day_ohmage_data = $('#one_day_ohmage_data').data('url');
    var one_day_fitbit_data = $('#one_day_fitbit_data').data('url');

    /// Get array of all data for rendering
    var ohmage_events_array = $('#ohmage_events_array').data('attribute');
    var pam_events_array = $('#pam_events_array').data('attribute');
    var fitbit_events_array = $('#fitbit_events_array').data('attribute');
    var annotation_events_array = $('#annotation_events_array').data('attribute');
    var events_array = $.merge($.merge($.merge( $.merge( [], pam_events_array ), ohmage_events_array), fitbit_events_array), annotation_events_array);


    // get the dummy data we created
    $.getJSON(calendar_data)
        .done(function(data) {
            console.log("Loaded!: ", data);
            // get just our own data to display on this thing
            my_daily_data = data['users']['c6651b99_8f9c_4d83_8f4b_8c02a00ddf9c']['daily'];

            console.log("User data!: ", my_daily_data);

            var my_daily_array = Object.keys(my_daily_data).map(function(k) { return my_daily_data[k] });

            // determine the maximum value for each metric so we can scale it
            // 'ranges' is an object with a key for each metric and its value being the max for that metric
            ranges = metrics.reduce(function(result, m) {
                result[m] = d3.max(my_daily_array, function(d) { return d[m]; });
                return result;
            }, {});

            // ranges = {max_gait_speed_in_meter_per_second: 10, active_time_in_seconds: 11000, time_not_at_home_in_seconds: 40000};
            // deviations = metrics.reduce(function(result, m) {
            //     result[m] = d3.deviation(my_daily_array, function(d) {return d[m]});
            //     return result;
            // }, {});

            // means = metrics.reduce(function(result, m) {
            //     result[m] = d3.mean(my_daily_array, function(d) {return d[m]});
            //     return result;
            // }, {});

            // console.log("Test 1: ", deviations);
            // console.log("Test 2: ", means);

            // let's iterate over the visible day_viz things and put stuff in them
            $(".day_viz").each(function(idx, elem) {

                if (my_daily_data.hasOwnProperty($(this).data('day'))) {
                    var today = my_daily_data[$(this).data('day')];
                    bindDay(today, ranges, $(this));
                }
            });
        })
        .fail(function() {
            alert("User does not have mobility daily data!");
        });

    // create the main calendar widget
    $('#calendar').fullCalendar({
        header: {
            right: 'prev,next,today,year,month',
            left: 'title'
        },
        defaultView: 'year',
        yearColumns: 2,
        selectable: true,
        timezone: "UTC",
        editable: true,
        unselectAuto: false,
        aspectRatio: 1.65,
        // googleCalendarApiKey: 'AIzaSyCZ3nNL96uCWFPKLPkSIzfxdRqg24vmTlE',

        events: events_array,


        eventClick: function(event) {
            if (event.title == 'ohmage') {
                window.open(one_day_ohmage_data + event.start);

            }
            else if (event.title == 'PAM') {
                window.open(one_day_pam_data + event.start);

            }
            else if (event.title == 'Fitbit') {
                window.open(one_day_fitbit_data + event.start);
            }
            else {
                document.getElementById("eventTitle").setAttribute('value', event.title);
                document.getElementById("eventDate").setAttribute('value', moment(event.start).format('YYYY-MM-DD'));
                document.getElementById("eventButton").click();
                $('#calendar').fullCalendar('updateEvent', event);
            }
        },

        viewRender: function() {
            if ($("#show_bar_numbers").is(":checked")) { $(".bar_label").show(); } else { $(".bar_label").hide(); }

        },
        eventAfterAllRender: function() {
            if ($("#show_events").is(":checked")) { $(".fc-event-container").show(); } else { $(".fc-event-container").hide(); }
        },
        dayRender: function(date, cell) {
            cell.css('position', 'relative');

            var $day_viz = $('<div />')
                .addClass('day_viz')
                .data('day', date.toJSON())
                .appendTo(cell);

            // fill it with data
            if (my_daily_data != null && my_daily_data.hasOwnProperty($day_viz.data('day'))) {
                var today = my_daily_data[$day_viz.data('day')];
                bindDay(today, ranges, $day_viz);
            }
        },
        select: function(start, end) {
            document.getElementById("eventDate").setAttribute('value', moment(end['_d']).format('YYYY-MM-DD'));
            document.getElementById("eventButton").click();

            // var title = prompt('Note:');
            // var eventData;
            // if (title) {
            //     eventData = {
            //         title: title,
            //         start: start,
            //         end: end,
            //         color: 'gray',
            //         textColor: 'white'
            //     };
            //     $('#calendar').fullCalendar('renderEvent', eventData, true);
            // }
            // $('#calendar').fullCalendar('unselect');

            // $("#info_content").stop().slideDown(300);

            // var end_inclusive = end.clone().subtract(1, 'day');

            // var $info = $("#info");

            // // get data for all selected days, if available
            // var days_data = null;

            // if (my_daily_data != null) {
            //     days_data = d3.time.day.utc.range(start, end)
            //         .filter(function(d) {
            //             return my_daily_data.hasOwnProperty(d3.time.day.utc.floor(d).toJSON());
            //         }).map(function(d) {
            //             return {date: d.toJSON(), values: my_daily_data[d.toJSON()]};
            //         });
            // }


            // console.log("Data for selected days: ", days_data);

            // $info.find("textarea").text();

            // if (days_data.length == 1) {
            //     // only a single day is selected
            //     $info.find("h2").text(start.format("MMM Do, YYYY"));

            //     $info.find("#info_notes").show();
            //     $info.find("#averaged-notice").hide();

            //     // populate the day fields
            //     $info.find("span.stat_value").each(function() {
            //         $(this).text(days_data[0].values[$(this).data('field')]);
            //     });
            // }
            // else if (days_data.length > 1) {
            //     // multiple days are selected
            //     if (start.year() == end.year())
            //         $info.find("h2").text(start.format("MMM Do") + " - " + end_inclusive.format("MMM Do, YYYY"));
            //     else
            //         $info.find("h2").text(start.format("MMM Do, YYYY") + " - " + end_inclusive.format("MMM Do, YYYY"));

            //     $info.find("#info_notes").hide();
            //     $info.find("#averaged-notice").show();

            //     // populate the day fields
            //     $info.find("span.stat_value").each(function() {
            //         var field = $(this).data('field');

            //         // average the value over all days
            //         $(this).text(+d3.mean(days_data, function(d) { return d.values[field]; }).toFixed(2));
            //     });
            // }
            // else {
            //     $("#info_content").hide();
            // }
        },
        // unselect: function() {
        //     $("#info_content").slideUp(300);
        // },
        eventDataTransform: function(eventData) {
            eventData.url = null;
            return eventData;
        }
    });

    //// Enable to select one varibales at a time on the calendar's gragh
    $('#max_gait_speed_in_meter_per_second_button').click(function() {
        $('div.day_viz div.time_not_at_home_in_seconds_bar').hide();
        $('div.day_viz div.active_time_in_seconds_bar').hide();
        $('div.day_viz div.max_gait_speed_in_meter_per_second_bar').show();
    });

    $('#time_not_at_home_in_seconds_button').click(function() {
        $('div.day_viz div.max_gait_speed_in_meter_per_second_bar').hide();
        $('div.day_viz div.active_time_in_seconds_bar').hide();
        $('div.day_viz div.time_not_at_home_in_seconds_bar').show();
    });

    $('#active_time_in_seconds_button').click(function() {
        $('div.day_viz div.time_not_at_home_in_seconds_bar').hide();
        $('div.day_viz div.max_gait_speed_in_meter_per_second_bar').hide();
        $('div.day_viz div.active_time_in_seconds_bar').show();
    });

    $('#all_three_bars').click(function() {
        $('div.day_viz div.active_time_in_seconds_bar').show();
        $('div.day_viz div.time_not_at_home_in_seconds_bar').show();
        $('div.day_viz div.max_gait_speed_in_meter_per_second_bar').show();
    })

    // move the filters to the middle of the calendar control's header
    // $("#filter_controls").detach().appendTo(".fc-center");

    // filter handlers

    $("#show_bar_numbers").change(function() {
        if ($(this).is(":checked")) {
            $(".bar_label").fadeTo(100, 1);
        }
        else {
            $(".bar_label").fadeTo(100, 0);
        }
    });

    $("#show_events").change(function() {
        if ($(this).is(":checked")) {
            $(".fc-event-container").fadeTo(100, 1);
        }
        else {
            $(".fc-event-container").fadeTo(100, 0);
        }
    });


});