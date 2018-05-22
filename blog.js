function carrega_blog() {
    var arquivo = "exemplo.txt"; //esse arquivo deve ser salvo como utf-8
    getFileFromServer(arquivo, function(request){
        if(request == null) { 
            console.log("Falha ao carregar o arquivo");}
        else { 
            console.log("Arquivo carregado");
            //variáveis comuns:
            var r = request;
            var titulo = r.slice(r.indexOf("[titulo]")+8,r.indexOf("[/titulo]"));
            var ordem = r.slice(r.indexOf("[pagina]")+8,r.indexOf("[/pagina]"));
            //

            document.title = titulo;
            for(var i=1;i<=r.length;i++){ // montador da lista de postagens || i=postagens;i>0;i--
                var t = "[t"+i+"]"; // titulo
                var p = "[p"+i+"]"; // post
                var d = "[d"+i+"]"; // data
                var a = "[a"+i+"]"; // autor
                var link = "[l"+i+"]"; // link
                var img = "[img"+i+"]"; // imagem, thumbnail
                var rincl = function(e){return r.includes(e);}
                var rslic = function(e,p){return r.slice(r.indexOf(e)+e.length,r.indexOf(p+i+"]"));}

                if(rincl(t)){ var p_titulo = rslic(t,"[/t"); }
                if(rincl(p)){ var p_post = rslic(p,"[/p"); } else {p_post="";}
                if(rincl(d)){ var p_data = rslic(d,"[/d"); } else {p_data="";}
                if(rincl(a)){ var p_autor = rslic(a,"[/a"); } else {p_autor="";}
                if(rincl(link)){ var p_link = rslic(link,"[/link"); } else {p_link="";}
                if(rincl(img)){ var p_imagem = rslic(img,"[/img"); } else {p_imagem="";}

                if(rincl(t)){ document.getElementById("blog").innerHTML+=
                    "<div class='feed'>"+
                    "<h1>"+p_titulo+"</h1>"+
                    p_post+"<br>"+
                    p_autor+" "+
                    "<h4>"+p_data+"</h4>"+
                    p_link+" "+
                    "<img src="+p_imagem+">"+
                    "</div>"; 
                }
            };
        } 
    })
}

function getFileFromServer(url, doneCallback) {
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = handleStateChange;
    xhr.open("GET", url, true);
    xhr.send();

    function handleStateChange() {
        if (xhr.readyState === 4) {
            doneCallback(xhr.status == 200 ? xhr.responseText : null);
        }
    }
}

window.onload = function() {
    carrega_blog();
}