var express = require('express');
var router = express.Router();

/**
 * Renderiza la interfaz para que el usuario ingrese su método de pago.
 */
router.get('/', function (req, res, next) {
  res.render('metodopago', { title: 'Express' });
});

module.exports = router;