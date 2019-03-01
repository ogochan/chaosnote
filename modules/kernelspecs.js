const fs = require('fs');
const path = require('path');

function make_filename(dir, body) {
	return (path.resolve(global.env.kernels_dir, dir + '/' + body));
}
function make_resourcefilename(dir, body) {
	return (`/kernelspecs/${dir}/${body}`);
}

kernelspecs =  {};

fs.readdirSync(global.env.kernels_dir).forEach((dir) => {
	kernelspecs[dir] = {
		name: dir,
		resources: {}
	};
	fs.readdirSync(`${global.env.kernels_dir}/${dir}`).forEach((res) => {
		if ( res == 'kernel.json' ) {
			spec = JSON.parse(fs.readFileSync(make_filename(dir, 'kernel.json'), 'utf8'))
			if ( !spec['interrupt_mode'] ) {
				spec['interrupt_mode'] = 'signal';
			}
			if ( !spec['metadata'] ) {
				spec['metadata'] = {};
			}
			if ( !spec['env'] ) {
				spec['env'] = {};
			}
			kernelspecs[dir].spec = spec;
		} else
		if ( res.match(/^logo-32x32/) ) {
			kernelspecs[dir].resources['logo-32x32'] = make_resourcefilename(dir, res);
		} else
		if ( res.match(/^logo-64x64/) ) {
			kernelspecs[dir].resources['logo-64x64'] = make_resourcefilename(dir, res);
		} else {
			kernelspecs[dir].resources[res] = make_resourcefilename(dir, res);
		}
	});
});
//console.log(kernelspecs);

module.exports = kernelspecs;
