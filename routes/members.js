var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
    res.render('scenes', { title: 'scenes', view: 'scenes' });
});

router.param(function(name, fn){
    if (fn instanceof RegExp) {
        return function(req, res, next, val){
            var captures;

            if (captures = fn.exec(String(val))) {
                req.params[name] = captures[0];
                next();
            } else {
                next('route');
            }
        }
    }
});

router.param('id', /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i); 

router.get('/:id', function(req, res) {
    
    Scene.findOne({id: req.params.id}).exec(function(err, scene){
        if (err) {
            return next(err);
        }
        else if (!scene) {
            return next();
        }
	console.log(JSON.stringify(scene));
	res.json(scene);
    });
});


module.exports = router;
