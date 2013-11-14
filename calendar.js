function Calendar(containerId, config) {
    
    var ACTIVITY_ID_PREFIX = "calendarActivityId_";

    if (config===undefined) config = {};
    if (config.initialHour===undefined || config.initialHour<0 || config.initialHour>23) {
        config.initialHour = 0;
    }
    if (config.onClick===undefined) config.onClick = null;
    if (config.onDblClick===undefined) config.onDblClick = null;
    // If onclick event is present and onmouseover is omitted, we create
    // one default event handler for change mouse pointer
    if (config.onMouseOver===undefined) {
        if (config.onClick!==null) {
            config.onMouseOver = function() { document.body.style.cursor = 'pointer'; };
        } else {
            config.onMouseOver = null;
        }
    }
    // If onclick event is present and onmouseout is omitted, we create
    // one default event handler for change mouse pointer
    if (config.onMouseOut===undefined) {
        if (config.onClick!==null) {
            config.onMouseOut = function() { document.body.style.cursor = 'default'; };
        } else {
            config.onMouseOut = null;
        }
    }

    var year = null;
    var month = null;
    var border = null;
    var hourWidth = null;
    var hourHeight = null;
    var dayWidth = null;
    var activities = {};

    var container = $("#"+containerId);
    
    var daysInMonth = function(year, month) {
        return 32 - new Date(year, month, 32).getDate();
    };
    
    var removeUnits = function(args) {
        return parseInt(args.replace("px", ""), 10);
    };

    // http://chris-spittles.co.uk/?p=531
    var scrollbarWidth = function() {
        var $inner = $('<div style="width: 100%; height:200px;">test</div>'),
            $outer = $('<div style="width:200px;height:150px; position: absolute; top: 0; left: 0; visibility: hidden; overflow:hidden;"></div>').append($inner),
            inner = $inner[0],
            outer = $outer[0];

        $('body').append(outer);
        var width1 = inner.offsetWidth;
        $outer.css('overflow', 'scroll');
        var width2 = outer.clientWidth;
        $outer.remove();

        return (width1-width2);
    };
    
    this.clear = function() {
        container.html("");
        activities = {};
    };
    
    this.setMonth = function(_year, _month) {
        this.clear();
        
        year = _year;
        month = _month;
        
        var numberOfDays = daysInMonth(year, month-1);
        
        var table, thead, tbody, td, td, div;
        
        table = document.createElement("table");
        table.setAttribute("class", "calendar");
        table.setAttribute("style", "border-collapse: separate; border-spacing: 0");
        document.getElementById(containerId).appendChild(table);
        
        thead = document.createElement("thead");
        table.appendChild(thead);
        
        tr = document.createElement("tr");
        thead.appendChild(tr);
        
        tr.appendChild(document.createElement("td"));
        for (var day=1; day<=numberOfDays; day++) {
            td = document.createElement("td");
            tr.appendChild(td);
            
            td.appendChild(document.createTextNode(day));
        }

        div = document.createElement("div");
        div.setAttribute("class", "calendar");
        div.setAttribute("style", "position: relative; overflow-x: hidden; overflow-y: scroll; padding: 0");
        document.getElementById(containerId).appendChild(div);
        
        table = document.createElement("table");
        table.setAttribute("class", "calendar");
        table.setAttribute("style", "width: 100%; border-collapse: separate; border-spacing: 0");
        div.appendChild(table);
        
        tbody = document.createElement("tbody");
        table.appendChild(tbody);
        
        for (var hour=0; hour<24; hour++) {
            tr = document.createElement("tr");
            tbody.appendChild(tr);
            
            td = document.createElement("td");
            tr.appendChild(td);
            
            td.appendChild(document.createTextNode((hour<10? "0"+hour: hour)+":00"));
            
            for (var day=1; day<=numberOfDays; day++) {
                td = document.createElement("td");
                var dayOfWeek = new Date(year, month-1, day).getDay();
                if (dayOfWeek===6 || dayOfWeek===0) {
                    td.setAttribute("class", "calendar-weekend");
                } else {
                    td.setAttribute("class", "calendar-no-weekend");
                }
                td.setAttribute("data-calendar-day", day);
                td.setAttribute("data-calendar-hour", hour);
                tr.appendChild(td);
                
                if (config.onClick!==null) {
                    td.onclick = function() {
                        config.onClick(
                            parseInt(this.getAttribute("data-calendar-day"), 10),
                            parseInt(this.getAttribute("data-calendar-hour"), 10)
                        );
                    };
                }
                if (config.onDblClick!==null) {
                    td.ondblclick = function() {
                        config.onDblClick(
                            parseInt(this.getAttribute("data-calendar-day"), 10),
                            parseInt(this.getAttribute("data-calendar-hour"), 10)
                        );
                    };
                }
                if (config.onMouseOver!==null) {
                    td.onmouseover = function() {
                        config.onMouseOver(
                            parseInt(this.getAttribute("data-calendar-day"), 10),
                            parseInt(this.getAttribute("data-calendar-hour"), 10)
                        );
                    };
                }
                if (config.onMouseOut!==null) {
                    td.onmouseout = function() {
                        config.onMouseOut(
                            parseInt(this.getAttribute("data-calendar-day"), 10),
                            parseInt(this.getAttribute("data-calendar-hour"), 10)
                        );
                    };
                }
            }
        }
        
        var hourCell = container.find("tbody tr:first-child td:first-child");
        border = removeUnits(hourCell.css("border-left-width"));
        hourWidth = hourCell.innerWidth();
        hourHeight = hourCell.innerHeight();

        var dayCell = container.find("table thead tr td:nth-child(2)");
        dayWidth = dayCell.innerWidth();
        dayHeight = dayCell.innerHeight();

        var table = container.find("table");
        table.css("border-collapse", "collapse");
        
        var div = container.find("div");
        div.css("width", hourWidth+border*2+(dayWidth+border)*numberOfDays+scrollbarWidth());
        div.css("border-bottom", table.find('td').css("border-bottom"));
        
        this.scrollToHour(config.initialHour);
    };
    
    this.scrollToHour = function(hour) {
        $("div.calendar").scrollTop((border+hourHeight)*hour);
    };
    
    this.addActivity = function(activityConfig) {
        if (activityConfig===undefined || activityConfig.id===undefined ||
            activityConfig.start===undefined || activityConfig.end===undefined) {
            throw "IlegalArgumentError";
        }
        
        if (activityConfig.data===undefined) activityConfig.data = null;
        if (activityConfig.text===undefined) activityConfig.text = null;
        if (activityConfig.title===undefined) activityConfig.title = null;
        if (activityConfig.class===undefined) activityConfig.class = "blue-activity";
        if (activityConfig.style===undefined) activityConfig.style = null;
        if (activityConfig.onClick===undefined) activityConfig.onClick = null;
        if (activityConfig.onDblClick===undefined) activityConfig.onDblClick = null;
        // If onclick event is present and onmouseover is omitted, we create
        // one default event handler for change mouse pointer
        if (activityConfig.onMouseOver===undefined) {
            if (activityConfig.onClick!==null) {
                activityConfig.onMouseOver = function() { document.body.style.cursor = 'pointer'; };
            } else {
                activityConfig.onMouseOver = null;
            }
        }
        // If onclick event is present and onmouseout is omitted, we create
        // one default event handler for change mouse pointer
        if (activityConfig.onMouseOut===undefined) {
            if (activityConfig.onClick!==null) {
                activityConfig.onMouseOut = function() { document.body.style.cursor = 'default'; };
            } else {
                activityConfig.onMouseOut = null;
            }
        }
        
        activityConfig.end = new Date(activityConfig.end.valueOf()-60000);
        
        var startTime = new Date(activityConfig.start.getFullYear(), activityConfig.start.getMonth(), activityConfig.start.getDate());
        var endTime = new Date(activityConfig.end.getFullYear(), activityConfig.end.getMonth(), activityConfig.end.getDate());
        var startCalendar = new Date(year, month-1, 1);
        var endCalendar = new Date(year, month, daysInMonth(year, month-1));

        var from = Math.max(startTime.getTime(), startCalendar.getTime());
        var to = Math.min(endTime.getTime(), endCalendar.getTime());
        for (var day=from; day<=to; day+=86400000) {

            var left = border*2+hourWidth+(dayWidth+border)*(new Date(day).getDate()-1);
            var top = border;
            if (day===from) {
                var seps = activityConfig.start.getHours();
                var hours = (activityConfig.start.getHours()*60+activityConfig.start.getMinutes())/60;
                top += hours*hourHeight+border*seps;
            }
            var seps;
            var hours;
            if (day===from && day===to) {
                seps = activityConfig.end.getHours()-activityConfig.start.getHours();
                hours = (activityConfig.end.getHours()*60+activityConfig.end.getMinutes()-activityConfig.start.getHours()*60-activityConfig.start.getMinutes()+1)/60;
            } else if (day===from) {
                seps = 24-activityConfig.start.getHours();
                hours = (23*60+59-activityConfig.start.getHours()*60-activityConfig.start.getMinutes()+1)/60;
            } else if (day===to) {
                seps = activityConfig.end.getHours();
                hours = (activityConfig.end.getHours()*60+activityConfig.end.getMinutes())/60;
            } else {
                seps = 24;
                hours = 24;
            }
            var height = hours*hourHeight+border*seps;

            var div = document.createElement("div");
            div.setAttribute("id", ACTIVITY_ID_PREFIX+activityConfig.id);
            if (activityConfig.text!==null) {
                div.appendChild(document.createTextNode(activityConfig.text));
            }
            if (activityConfig.title!==null) {
                div.setAttribute("title", activityConfig.title);
            }
            div.setAttribute("class", activityConfig.class);
            if (activityConfig.style!==null) {
                div.setAttribute("style", activityConfig.style);
            }
            if (activityConfig.onClick!==null) {
                div.onclick = function() {
                    var activity = activities[this.id];
                    activityConfig.onClick(activity.id, activity.start, activity.end, activity.data);
                };
            }
            if (activityConfig.onDblClick!==null) {
                div.ondblclick = function() {
                    var activity = activities[this.id];
                    activityConfig.onDblClick(activity.id, activity.start, activity.end, activity.data);
                };
            }
            if (activityConfig.onMouseOver!==null) {
                div.onmouseover = function() {
                    var activity = activities[this.id];
                    activityConfig.onMouseOver(activity.id, activity.start, activity.end, activity.data);
                };
            }
            if (activityConfig.onMouseOut!==null) {
                div.onmouseout = function() {
                    var activity = activities[this.id];
                    // El usuario podría haber borrado la actividad en un evento anterior
                    if (activity!==undefined) {
                        activityConfig.onMouseOut(activity.id, activity.start, activity.end, activity.data);
                    }
                };
            }
            container.find("div.calendar").prepend(div);

            var activity = $(div);
            var activityBorder = removeUnits(activity.css("border-left-width"));
            activity
                .css("overflow", "hidden")
                .css("overflow-wrap", "break-word")
                .css("padding", "0")
                .css("margin", "0")
                .css("text-align", "center")
                .css("position", "absolute")
                .css("left", left+"px")
                .css("top", top+"px")
                .css("width", (dayWidth-activityBorder*2)+"px")
                .css("height", (height-activityBorder*2)+"px")
                .css("line-height", (height-activityBorder*2)+"px");
            
            activities[ACTIVITY_ID_PREFIX+activityConfig.id] = {
                id: activityConfig.id,
                start: activityConfig.start,
                end: new Date(activityConfig.end.valueOf()+60000),
                data: activityConfig.data
            };
        }
    };
    
    this.removeActivity = function(id) {
        // Activity to delete
        var activity = document.getElementById(ACTIVITY_ID_PREFIX+id);
        // Delete from UI (delete div element)
        activity.parentNode.removeChild(activity);
        // Remove from activities list
        delete activities[ACTIVITY_ID_PREFIX+id];
    };
}
