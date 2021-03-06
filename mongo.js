
var express = require('express'),
    app=express();
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert'); //Comprueba errores
var url = 'mongodb://localhost:27017/';
var fs = require('fs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require('mongodb').ObjectID;





MongoClient.connect(url, function(err, db){
    assert.equal(null, err);
    console.log("Conectados correctamente");
    var dbo=db.db('videojuegos');
    dbo.collection('Juegos').find({}).toArray(function(err, docs){
        docs.forEach(function(doc){
            console.log(doc.categoria);
        });
        db.close();
    });
    console.log("Ejecutando find()");
});
    



    app.get('/', function(req, res){


        MongoClient.connect(url, function(err, db){
            assert.equal(null, err);
            console.log("Conectados correctamente");
            var dbo=db.db('videojuegos');
            dbo.collection('Juegos').find({}).toArray(function(err, docs){
                var lista="";
                var inicio_tabla='<table class="table">\
                <thead>\
                <tr collsp class="bg-primary" >\
                <th scope="col">ID</th>\
                      <th scope="col">Nombre</th>\
                      <th scope="col">categoria</th>\
                      <th scope="col">Año de salida</th>\
                      <th scope="col"></th>\
                      <th scope="col"></th>\
                    </tr>\
                  </thead>\
                  <tbody>';
                docs.forEach(function(doc){
                    var tr_id="<tr class='table-primary' ><td>"+doc._id+"</td>";
                    var tr_nombre="<td>"+doc.nombre+"</td>";
                    var tr_categoria="<td>"+doc.categoria+"</td>";
                    var tr_año="<td>"+doc.añosalida+"</td>";

                    id_juego = doc._id;

                    btnEditar = "<td><a class='btn btn-link' href=http://localhost:3000/modificar/"+id_juego+">Editar</a></td>";
                    btnBorrar = "<td><a class='btn btn-link' href=http://localhost:3000/eliminar/"+id_juego+">Eliminar</a></td>";
                    
                    var cierre_tr="</tr>";
                    var tabla=tr_id+tr_nombre+tr_categoria+tr_año+btnEditar+btnBorrar+cierre_tr;
                    lista=lista+tabla;
                });
                var cierre_tabla = '</tbody>\
                            </table>';
                var botonCrear = '<a class="btn btn-primary" href="http://localhost:3000/insertar" >Crear<a/>';
                var tablaFinal = inicio_tabla+lista+cierre_tabla+botonCrear;
                fs.readFile("head.html","utf8",(err,data)=>{
                if(err){
                    console.log(err);
                    return err;
                }else{
                    res.send(data+tablaFinal);
                }
            })
             db.close();
            });
        });

    });









    app.get('/insertar', function(req, res){
        var formulario = '<form method="POST">\
        <label for="nombre">Nombre del Juego</label>\
        <input class="form-control" type="text" name="nombre">\
        <br>\
        <label for="duracion">categoria</label>\
        <input class="form-control" type="text" name="categoria">\
        <br>\
        <label for="descripcion">Año de salida</label>\
        <input class="form-control" type="text" name="año">\
        <br>\
        <input  value="Enviar" type="submit" value="Añadir">\
    </form>';

    fs.readFile("head.html","utf8",(err,data)=>{
        if(err){
            console.log(err);
            return err;
        }else{
            res.send(data+formulario);
        }
    })

    });



    app.post('/insertar',urlencodedParser, function(req, res){
        var inputNombre = req.body.nombre;
        var inputCategoria = req.body.categoria;
        var inputAño = req.body.año;


        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("videojuegos");

        var myobj = { nombre: inputNombre, categoria: inputCategoria, añosalida: inputAño};
        dbo.collection("Juegos").insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log("Nuevo Juego insertado");
            db.close();
        });       

        res.redirect("/");

        });   

    });



    app.get('/eliminar/:id',function(req,res){
        var idJuego = req.params.id;

        MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("videojuegos");
        var consulta = { _id: idJuego };
        dbo.collection("Juegos").deleteOne({_id: new ObjectID(idJuego)});
        console.log("Juego Eliminado");
        res.redirect("/");


        });

    });


app.get('/modificar/:id',function(req,res){
    var idJuego = req.params.id;
     MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("videojuegos");
        dbo.collection('Juegos').findOne({_id: new ObjectID(idJuego)},function(err, docs){


             var modificar = '<form method="POST" action="http://localhost:3000/modificar/'+[idJuego]+'">\
            <label for="nombre">Nombre del Juego</label>\
            <input class="form-control" type="text" name="nombre" value="'+docs["nombre"]+'">\
            <br>\
            <label for="duracion">Categoria</label>\
            <input class="form-control" type="text" name="categoria" value="'+docs["categoria"]+'">\
            <br>\
            <label for="descripcion">Año de salida</label>\
            <input class="form-control" type="text" name="año" value="'+docs["añosalida"]+'">\
            <br>\
            <input type="submit">\
            </form>';

             fs.readFile("head.html","utf8",(err,data)=>{
                if(err){
                    console.log(err);
                    return err;
                }else{
                    res.send(data+modificar);
                }
            })


        });
    });

});




app.post('/modificar/:id',urlencodedParser,function(req,res){
    var idJuego = req.params.id;

    var inputNombre = req.body.nombre;
    var inputCategoria = req.body.categoria;
    var inputAño = req.body.año;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
            var dbo = db.db("videojuegos");
        var jsquery = {_id: new ObjectID(idJuego)};
            var newvalues = { $set: { nombre: inputNombre, categoria: inputCategoria, añosalida: inputAño} };
            dbo.collection('Juegos').updateOne(jsquery, newvalues, function(err, result){

                console.log("Nuevo Elemento Modificado");
                res.redirect("/");
    
            }); 
        
        });

});








    app.use(function(req, res){
        res.sendStatus(404);
    });
    var server = app.listen(3000, function(){
        var port = server.address().port;
        console.log("Express server listening on port %s", port);
    });