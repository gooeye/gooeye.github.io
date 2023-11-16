var cursor = document.createElement("div");
cursor.id = "cursor";
cursor.style.pointerEvents = "none";
document.body.appendChild(cursor);
var lineSize = 5;
function moveCursor(e) {
    let x, y;
    x = e.clientX - lineSize;
    y = e.clientY - lineSize;
    document.getElementById('location').innerHTML = e.clientX + "px, " + e.clientY; + "px";
    let el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest(".big-card")) {
        cursor.style.backgroundColor = "#ffb277";
    } else if (el && el.closest(".card")) {
        cursor.style.backgroundColor = "brown";
    } else{
        cursor.style.backgroundColor = "black";
    }
    if (el && el.classList.contains("content")) {
        let rect = el.getBoundingClientRect();
        cursor.classList.add("block");
        if (el.classList.contains("content-block")) {
            cursor.style.width = lineSize + 'px';
            cursor.style.height = rect.bottom - rect.top + 'px';
            cursor.style.left = rect.left - lineSize * 2 + 'px';
            cursor.style.top = rect.top + 'px';
        } else if (el.classList.contains("content-cover")) {
            cursor.style.width = rect.right - rect.left + lineSize * 2 + 'px';
            cursor.style.height = rect.bottom - rect.top + lineSize * 2 + 'px';
            cursor.style.left = rect.left - lineSize * 1 + 'px';
            cursor.style.top = rect.top - lineSize * 1 + 'px';
            cursor.classList.add("round");
        } else {
            cursor.style.width = rect.right - rect.left + 'px';
            cursor.style.height = lineSize + 'px';
            cursor.style.left = rect.left + 'px';
            cursor.style.top = rect.bottom + 'px';
        }
    } else {
        cursor.style.width = lineSize * 2 + 'px';
        cursor.style.height = lineSize * 2 + 'px';
        cursor.classList.remove("block");
        cursor.classList.remove("round");
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    }
}
let enableCall = true;
let lastE;
document.addEventListener('mousemove', (e) => {
    if (!enableCall) {
        lastE = e;
        return;
    }
    enableCall = false;
    moveCursor(e);
    setTimeout(() => {
        enableCall = true;
        moveCursor(lastE);
    }, 50);
});
document.addEventListener('scroll', () => {moveCursor(lastE)});