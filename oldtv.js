var colours=[
    ["red","#ff0000"],
    ["blue","#0000ff"],
    ["green","#00ff00"],
    ["yellow","#ffff00"],
    ["purple","#ff00ff"],
    ["cyan","#00ffff"],
]
var m=2;
var score=0;
document.getElementById("start").onclick=function() {
    document.getElementById("start").style.display="none";
    var c=Math.floor((Math.random()*colours.length));
    do {
        var d=Math.floor((Math.random()*colours.length));
    } while (d==c)
    if(Math.random()<0.5) {
        m=1;
        document.getElementById("colour").style.color=colours[c][1];
        document.getElementById("colour").innerHTML=colours[c][0];
    } else {
        m=0;
        document.getElementById("colour").style.color=colours[d][1];
        document.getElementById("colour").innerHTML=colours[c][0];
    }
}
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if(m==2) {
    } else if(m==0) {
        score++;
        var c=Math.floor((Math.random()*colours.length));
        do {
            var d=Math.floor((Math.random()*colours.length));
        } while (d==c)
        if(Math.random()<0.5) {
            m=1;
            document.getElementById("colour").style.color=colours[c][1];
            document.getElementById("colour").innerHTML=colours[c][0];
        } else {
            m=0;
            document.getElementById("colour").style.color=colours[d][1];
            document.getElementById("colour").innerHTML=colours[c][0];
        }
    } else if(m==1) {
        alert("you lose! your score is "+score);
        m=2;
        score=0;
        document.getElementById("start").style.display="block";
        document.getElementById("colour").innerHTML="";
    }
}, false);
document.addEventListener("click", function() {
    if(m==2) {
        break;
    } else if(m==1) {
        score++;
        var c=Math.floor((Math.random()*colours.length));
        do {
            var d=Math.floor((Math.random()*colours.length));
        } while (d==c)
        if(Math.random()<0.5) {
            m=1;
            document.getElementById("colour").style.color=colours[c][1];
            document.getElementById("colour").innerHTML=colours[c][0];
        } else {
            m=0;
            document.getElementById("colour").style.color=colours[d][1];
            document.getElementById("colour").innerHTML=colours[c][0];
        }
    } else if(m==0) {
        alert("you lose! your score is "+score);
        m=2;
        score=0;
        document.getElementById("start").style.display="block";
        document.getElementById("colour").innerHTML="";
    }
});