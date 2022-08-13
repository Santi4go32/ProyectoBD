var express = require('express');
var router = express.Router();

/**
 * Renderiza la interfaz donde el usuario escoje si es un usuario de la app o un trabajador.
 */
router.get('/', function (req, res, next) {
  res.render('typeuser', { title: 'Express' });
});

module.exports = router;