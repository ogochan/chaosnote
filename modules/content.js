const Fs = require('fs');
const Path = require('path');
const Mime = require('mime');

const BASE_DIR = global.env.data_dir;

function make_path(dir, file){
    if ( dir == '/' ) {
        return ( '/' + file);
	} else
	if ( dir == '' ) {
		return (file);
    } else {
        return ( dir + '/' + file );
    }
}

class Content {
	constructor(path) {
		let file_path = make_path(BASE_DIR, path);
		let stat = Fs.statSync(file_path);

		this.file_path = file_path;
		this.stat = stat;
		this.name = Path.basename(path);
		this.path = path;
		this.created = stat.ctime;
		this.format = null;
		this.last_modified = stat.mtime;
		this.mimetype = null;
		this.size = null;
		this.writable = ( stat.mode & 200 ) ? true : false
		this.content = {
			cells: [],
			metadata: {},
			nbformat: 4,
			nbformat_minor: 2
		}
	}
	static delete_(path) {
		let file_path = make_path(BASE_DIR, path);
		let stat = Fs.statSync(file_path);
		let succ = false;

		if (( stat ) &&
			( stat.mode & 200 )) {
			if ( stat.isDirectory() ) {
				Fs.rmdirSync(file_path);
				succ = true;
			} else {
				Fs.unlinkSync(file_path);
				succ = true;
			}
		}
		return (succ);
	}
	static new_file(path) {
		let dir = make_path(BASE_DIR, path);
		let name = 'Untitled.ipynb'
		let fn = make_path(dir, name);
		let count = 2;
		while ( Fs.existsSync(fn) ) {
			name = `Untitled${count}.ipynb`;
			fn = make_path(dir, name);
			count ++;
		}
		Fs.writeFileSync(fn, JSON.stringify({
			cells: [],
			metadata: {},
			nbformat: 4,
			nbformat_minor: 2
		}));

		return (make_path(path, name));
	}
	load(checkpoint) {
		let content;
		let type;
		let mime_type;

		//console.log('stat:', this.stat);
		//console.log('path:', this.file_path);
		if ( this.stat.isFile() ) {
			let checkpoint_dir;
			let path;
			if (( typeof checkpoint === 'undefined' ) ||
				( !checkpoint )) {
				path = this.file_path;
			} else {
				checkpoint_dir = `${Path.dirname(this.file_path)}/.ipynb_checkpoints`;
				path = `${checkpoint_dir}/${Path.basename(this.file_path, '.ipynb')}-checkpoint.ipynb`;
			}
			this.stat = Fs.statSync(path);
			this.size = this.stat.size;
			if ( this.file_path.match(/\.ipynb$/) ) {
				this.type = "notebook";
				this.format = "json";
				content = JSON.parse(Fs.readFileSync(path, 'utf8'));
				content.cells.forEach((cell) => {
					cell.source = cell.source.join('');
				});
			} else {
				if ( this.file_path.match(/.txt$/) ) {
					this.type = 'file';
					mime_type = 'text/plain';
				} else {
					this.type = 'file';
					this.mime_type = Mime.getType(this.file_path);
				}
				content = Fs.readFileSync(this.file_path);
			}
		} else {
			this.type = "directory";
			content = [];
			Fs.readdirSync(this.file_path).forEach((file) => {
				if ( file.match(/^\./) ) {
				} else {
					let real_path = make_path(this.file_path, file);
					let stat = Fs.statSync(real_path);
					switch (true) {
					case stat.isFile():
						if ( file.match(/\.ipynb$/) ) {
							type = 'notebook';
							mime_type = null;
						} else
						if ( file.match(/.txt$/) ) {
							type = 'file';
							mime_type = 'text/plain';
						} else {
							type = "file";
							mime_type = Mime.getType(real_path);
						}
						content.push({
							name: file,
							path: make_path(this.path, file),
							last_modified: stat.mtime,
							created: stat.ctime,
							content: null,
							format: null,
							mimetype: mime_type,
							size: stat.size,
							writable: ( stat.mode & 200 ) ? true: false,
							type: type
						});
						break;
					case stat.isDirectory():
						content.push({
							name: file,
							path: make_path(this.path, file),
							last_modified: stat.mtime,
							created: stat.ctime,
							content: null,
							format: null,
							mimetype: null,
							size: null,
							writable: ( stat.mode & 200 ) ? true: false,
							type: "directory"
						});
						break;
					}
				}
			});
		}
		this.content = content;

		return (content);
	}
	set_body(content) {
		this.content = content;
	}
	save(checkpoint) {
		let checkpoint_dir;
		let path;
		
		if (( typeof checkpoint === 'undefined' ) ||
			( !checkpoint )) {
			path = this.file_path;
		} else {
			checkpoint_dir = `${Path.dirname(this.file_path)}/.ipynb_checkpoints`;
			let stat = Fs.statSync(checkpoint_dir);
			if ( !stat ) {
				Fs.mkdir(checkpoint_dir);
			}
			path = `${checkpoint_dir}/${Path.basename(this.file_path, '.ipynb')}-checkpoint.ipynb`;
		}
		this.content.cells.forEach((cell) => {
			let lines = [];
			if ( cell.source != '' ) {
				let source = cell.source.split('\n');
				source.slice(0,-1).forEach((line) => {
					lines.push(line + '\n');
				});
				lines.push(source.slice(-1)[0]);
			}
			cell.source = lines;
		});

		let content_str = JSON.stringify(this.content, null, " ");

		Fs.writeFileSync(path, content_str);
		let stat = Fs.statSync(path);
		this.stat = Fs.statSync(path);
		this.size = this.stat.size;
		this.last_modified = stat.mtime;

		return ({
			size: stat.size,
			mtime: stat.msize
		});
	}
	rename(new_path) {
		let new_file_path = make_path(BASE_DIR, new_path);
		
		Fs.renameSync(this.file_path, new_file_path);
		this.file_path = new_file_path;
		this.path = new_path;
		return (this);
	}
	attribute() {
		return({
			content: null,
			created: this.created,
			format: this.format,
			last_modified: this.last_modified,
			mimetype: this.mimetype,
			name: this.name,
			path: this.path,
			size: this.size,
			type: this.type,
			writable: this.writable});
	}
}

module.exports = Content;
