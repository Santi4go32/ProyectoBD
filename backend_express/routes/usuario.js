var express = require('express');
var bodyParser = require('body-parser')
var idUsuario
var router = express.Router();
const connect = require('./db_pool_connect');

/**
 * Listar todos los trabajadores y los pagos realizados
 */
router.get('/:id', function (req, res, next) {
  
  
  connect(function (err, client, done) {
    var renderUno
    var renderDos
    if (err) {
      return console.error('error fetching client from pool', err);
    }
    console.log("GET " + JSON.stringify(req.body));

    client.query(`SELECT * FROM Persona NATURAL JOIN Trabajador NATURAL JOIN Labor WHERE ocupado=FALSE;`, function (err, result) {

      if (err) {
        return console.error('error running query', err);
      }
      renderUno=result.rows
    });

    client.query(`SELECT * FROM Usuario_trabajador NATURAL JOIN Labor WHERE id_telefono='${req.params.id}';`, function (err, result) {
      done(err);

      if (err) {
        return console.error('error running query', err);
      }
      renderDos=result.rows
      res.render('layout', {users:renderUno, registros:renderDos});
    });
    
  });

})


/**
 * Aplica los filtros en base al precio y a la labor introducida por el usuario. 
 * Actualiza el estado de un trabajador cuando se encuentre ocupado.
 * Solicita a un trabajador.
 * Lista los pago realizados por el usuario.
 */
router.post('/:id', function (req, res, next) {
  connect(function (err, client, done) {

    console.log("POST " + JSON.stringify(req.body.labor));
    
    
    let sql = `SELECT * FROM Persona NATURAL JOIN Trabajador NATURAL JOIN Labor WHERE ocupado=FALSE;`

    if(req.body.labor!=0 && req.body.precio==''){
      sql = `SELECT * FROM Persona NATURAL JOIN Trabajador NATURAL JOIN Labor WHERE nombreLabor = '${req.body.labor}'
              AND ocupado=FALSE;`  
      console.log("PRIMER IF Labor: " + req.body.labor + ", Precio: " + req.body.precio);
    }
    else if(req.body.labor==0 && req.body.precio!=''){
      sql = `SELECT * FROM Persona NATURAL JOIN Trabajador NATURAL JOIN Labor WHERE precioHora <= '${req.body.precio}'
             AND ocupado=FALSE;`
      console.log("SEGUNDO IF Labor: " + req.body.labor + ", Precio: " + req.body.precio);
    }
    else if(req.body.labor!=0 && req.body.precio!=''){
      sql = `SELECT * FROM Persona NATURAL JOIN Trabajador NATURAL JOIN Labor WHERE precioHora <= '${req.body.precio}' AND nombreLabor='${req.body.labor}'
              AND ocupado=FALSE;`
      console.log("TERCER IF Labor: " + req.body.labor + ", Precio: " + req.body.precio);
    }
    client.query(`SELECT * FROM Usuario_trabajador NATURAL JOIN Labor WHERE id_telefono='${req.params.id}';`, function (err, result) {
      done(err);

      if (err) {
        return console.error('error running query', err);
      }
      renderDos=result.rows
    });
    
    client.query(sql, function (err, result) {
      if (err) {
        return console.error('error running query', err);
      }
      primerRender=result.rows
      res.render('layout', {users:primerRender, registros:renderDos});
    });
    console.log("trabajador solicitado: " + req.body.elegirTrabajador) 
    console.log("trabajador solicitado 2: " + JSON.stringify(req.body.elegirTrabajador)) 
    idTrabajador=`${req.body.elegirTrabajador}`
    console.log("trabajador solicitado: " + req.body.elegirTrabajador) 
    trabajadorOcupado = `UPDATE Trabajador SET ocupado=TRUE WHERE id_trabajador=${req.body.elegirTrabajador};
                         DELETE FROM Usuario_trabajador WHERE id_trabajador=${req.body.elegirTrabajador} AND id_telefono='${req.params.id}';
                         INSERT INTO Usuario_trabajador VALUES (${req.body.elegirTrabajador}, '${req.params.id}');`
    
    client.query(trabajadorOcupado, function (err, result) {
      if (err) {
        return console.error('error running query', err);
      }
      res.redirect('back')
    });

    calificarTrabajador = `UPDATE Trabajador SET estrellas=((${req.body.star}+estrellas)/2) 
                          WHERE id_trabajador IN (SELECT id_trabajador FROM Usuario_trabajador NATURAL JOIN Trabajador
                          WHERE ocupado=FALSE);`
    console.log("Star: " + `${req.body.star}` + " id: " + idTrabajador)
    client.query(calificarTrabajador, function (err, result) {
      if (err) {
        return console.error('error running query', err);
      }
      res.redirect('back')
    });                
  })

})

module.exports = router;
