var svgList = document.getElementsByTagName("svg");
var num = 0;
svgList[num].classList.toggle("active")
function IntervalTimer(callback, interval) {
    var timerId, startTime, remaining = 0;
    var state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed

    this.pause = function () {
        if (state != 1) return;

        remaining = interval - (new Date() - startTime);
        window.clearInterval(timerId);
        state = 2;
    };

    this.resume = function () {
        if (state != 2) return;

        state = 3;
        window.setTimeout(this.timeoutCallback, remaining);
    };

    this.timeoutCallback = function () {
        if (state != 3) return;

        callback();

        startTime = new Date();
        timerId = window.setInterval(callback, interval);
        state = 1;
    };

    startTime = new Date();
    timerId = window.setInterval(callback, interval);
    state = 1;
}
function refresh() {
    for (svg of svgList) {
        if (svg.classList.contains("active")) svg.classList.remove("active"); 
    }
    setTimeout(() => {
        svgList[num].classList.add("active");
    },1000)
}
var next = () => {
    if (++num == svgList.length) num = 0;
    refresh();
}
function set(target) {
    let n = [].slice.call(labelList).indexOf(target);
    if (num != n) {
        num = n
        refresh();
    }
    timer.pause();
    console.log("set");
}
function unset() {
    timer.resume();
    console.log("unset");
}

var timer = new IntervalTimer(next, 10000);
var labelList = document.getElementsByClassName("svgLabel");
let i = 0
for (label of labelList) {
    label.addEventListener("mouseover", (event) => {set(event.target)});
    label.addEventListener("mouseleave", unset);
    i++;
}