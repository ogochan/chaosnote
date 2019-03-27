var express = require('express');
var router = express.Router();

const contents = require('./api_contents');
const sessions = require('./api_sessions');
const kernels = require('./api_kernels');
const is_authenticated = require('../modules/user.js').is_authenticated;

router.get('/contents/:path(*)/checkpoints', is_authenticated, contents.get_checkpoints);
router.post('/contents/:path(*)/checkpoints', is_authenticated, contents.post_checkpoints);

router.get('/contents/:path(*)', contents.get);
router.get('/contents', contents.get);
router.put('/contents/:path(*)', contents.put);
router.put('/contents', contents.put);
router.post('/contents', contents.post);
router.post('/contents/:path(*)', contents.post);
router.post('/contents/:path(*)/trust', contents.post_trust);
router.post('/contents', contents.put);

router.patch('/contents/:path(*)', contents.patch);
router.delete('/contents/:path(*)', contents.delete);

router.get('/sessions', sessions.get);
router.put('/sessions', sessions.put);
router.post('/sessions', sessions.post);
router.patch('/sessions/:id(*)', sessions.patch);
router.delete('/sessions/:id(*)', sessions.delete);

router.post('/kernels/:id(*)/restart', kernels.post);
router.ws('/kernels/:id/channels', kernels.channels);

router.get('/config/tree', function(req, res, next) {
	res.json({
		load_extensions: {
			"nbextensions_configurator/tree_tab/main": true
		}});
});
router.get('/config/common', function(req, res, next) {
	res.json({
		nbext_hide_incompat: false
	});
});
router.get('/config/edit', function(req, res, next) {
  res.json({});
});
router.get('/config/notebook', function(req, res, next) {
	res.json({
		load_extensions: {
			"jupyter-js-widgets/extension": true,
			"nbextensions_configurator/config_menu/main": true,
			"contrib_nbextensions_help_item/main": true,
			"jupyter_wysiwyg/index": true,
			"toc2/main": true,
			"nbTranslate/main": true,
			"fileupload/extension": true,
			"hide_input/main": true,
			"jupyter_emacskeys/init": false,
			"codefolding/main": true,
			"snippets/main": false,
			"move_selected_cells/main": true},
		 "nbTranslate": {
			 "targetLang": "jp",
			 "displayLangs": ["en", "jp"],
			 "langInMainMenu": false},
		 "Cell": {
			 "cm_config": {"lineNumbers": true}}}
	);
});

router.get('/terminals', function(req, res, next) {
  res.json([]);
});

router.get('/kernelspecs', function(req, res, next) {
	//console.log(global.kernelspecs);
	res.json({
		default: "ruby",
		kernelspecs: global.kernelspecs
	});
});

module.exports = router;
