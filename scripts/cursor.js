var parent = document.createElement("div");
var cursor = document.createElement("div");
parent.id = "cursor-parent";
cursor.id = "cursor";
cursor.style.pointerEvents = "none";
parent.appendChild(cursor);
document.body.appendChild(parent);
var lineSize = 5;
document.getElementById("cursorSize").innerText = lineSize;
const minLineSize = 1;
const maxLineSize = 10
function moveCursor(e) {
    let x, y;
    x = e.clientX - lineSize;
    y = e.clientY - lineSize;
    document.getElementById('location').innerHTML = e.clientX + "px, " + e.clientY + "px";
    let el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && el.closest(".hero")) {
        cursor.classList.add("c1");
        cursor.classList.remove("c2");
        cursor.classList.remove("faded");
    } else if (el && el.closest(".card")) {
        cursor.classList.add("c2");
        cursor.classList.remove("c1");
        cursor.classList.remove("faded");
    } else if (el && el.closest(".pin")) {
        cursor.classList.add("faded");
    } else{
        cursor.classList.remove("c1");
        cursor.classList.remove("c2");
        cursor.classList.remove("faded");
    }
    if (el && el.classList.contains("content")) {
        let rect = el.getBoundingClientRect();
        cursor.classList.add("block");
        if (el.classList.contains("content-block")) {
            cursor.style.width = lineSize + 'px';
            cursor.style.height = rect.bottom - rect.top + 'px';
            cursor.style.left = rect.left - lineSize * 2 + 'px';
            cursor.style.top = rect.top + 'px';
            parent.classList.remove("shadow");
        } else if (el.classList.contains("content-alt")) {
            let altText = el.tagName == "IMG" ? el.alt : el.dataset.alt;
            cursor.setAttribute("data-text", altText);
            cursor.style.width = '100px';
            cursor.style.height = '40px';
            cursor.style.left = rect.left + 20 + 'px';
            cursor.style.top = rect.top - 40 + 'px';
            cursor.classList.add("alt");
            parent.classList.add("shadow");
        } else {
            cursor.style.width = rect.right - rect.left + 'px';
            cursor.style.height = lineSize + 'px';
            cursor.style.left = rect.left + 'px';
            cursor.style.top = rect.bottom + 'px';
            cursor.classList.remove("alt");
            parent.classList.remove("shadow");
        }
    } else {
        cursor.style.width = lineSize * 2 + 'px';
        cursor.style.height = lineSize * 2 + 'px';
        cursor.classList.remove("block");
        cursor.classList.remove("alt");
        parent.classList.remove("shadow");
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
    setTimeout(() => {
        enableCall = true;
        moveCursor(lastE);
    }, 50);
});
document.addEventListener('scroll', () => {moveCursor(lastE)});
document.getElementById('decrement').addEventListener('click', () => {
    if (lineSize > minLineSize) lineSize--;
    document.getElementById("cursorSize").innerText = lineSize;
    moveCursor(lastE);
})
document.getElementById('increment').addEventListener('click', () => {
    if (lineSize < maxLineSize) lineSize++;
    document.getElementById("cursorSize").innerText = lineSize;
    moveCursor(lastE);
})