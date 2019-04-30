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
	constructor(user, path) {
		let stat = Content.stat(user, path);

		this.file_path = stat.file_path;
		this.user = stat.user;
		this.stat = stat.stat;
		this.name = stat.name
		this.path = stat.path;
		this.created = stat.created;
		this.format = stat.format;
		this.last_modified = stat.last_modified;
		this.mimetype = stat.mimetype;
		this.size = stat.size;
		this.writable = stat.writable;
		if ( stat.type == 'notebook' ) {
			this.content = {
				cells: [],
				metadata: {},
				nbformat: 4,
				nbformat_minor: 2
			}
		} else {
			this.content = null;
		}
	}
	static new_user(user) {
		let dir = make_path(BASE_DIR, user);
		if ( !Fs.existsSync(dir) ) {
			Fs.mkdirSync(dir, 0o755);
		}
	}
	static delete_(user, path) {
		let dir = make_path(BASE_DIR, user);
		let file_path = make_path(dir, path);
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
	static new_note(user, path) {
		let dir = make_path(BASE_DIR, user);
		let dir_path = make_path(dir, path);
		let name = 'Untitled.ipynb'
		let fn = make_path(dir_path, name);
		let count = 2;
		while ( Fs.existsSync(fn) ) {
			name = `Untitled${count}.ipynb`;
			fn = make_path(dir_path, name);
			count ++;
		}
		Fs.writeFileSync(fn, JSON.stringify({
			cells: [],
			metadata: {},
			nbformat: 4,
			nbformat_minor: 2
		}));

		return (name);
	}
	static new_folder(user, path) {
		let dir = make_path(BASE_DIR, user);
		let dir_path = make_path(dir, path);

		let name = 'Untitled Folder'
		let fn = make_path(dir_path, name);
		let count = 2;
		while ( Fs.existsSync(fn) ) {
			name = `Untitled Folder${count}`;
			fn = make_path(dir_path, name);
			count ++;
		}
		Fs.mkdirSync(fn, 0o755);

		return (name);
	}
	static copy_file(user, dir, path) {
		let dir_path = make_path(make_path(BASE_DIR, user), dir);
		let file_path = make_path(make_path(BASE_DIR, user), path);

		let ext = Path.extname(path);
		let base_name = Path.basename(path, ext);
		let name = `${base_name}${((ext) && ( ext != '' )) ? ext : ''}`
		let fn = make_path(dir_path, name);
		let count = 1;
		while ( Fs.existsSync(fn) ) {
			name = `${base_name}-Copy${count}${((ext) && ( ext != '' )) ? ext : ''}`;
			fn = make_path(dir_path, name);
			count ++;
		}
		Fs.copyFileSync(file_path, fn);
		return (name);
	}
	static stat(user, path)  {
		let type;
		let mime_type;
		let dir = make_path(BASE_DIR, user);
		let fn = make_path(dir, path);
		let _stat = Fs.statSync(fn);
		let ext = Path.extname(path);
		let size;

		if ( _stat.isFile() ) {
			if ( path.match(/\.ipynb$/) ) {
				type = 'notebook';
				mime_type = null;
			} else
			if ( path.match(/.txt$/) ) {
				type = 'file';
				mime_type = 'text/plain';
			} else
			if ( path.match(/.md$/) ) {
				type = 'markdown';
				mime_type = 'text/plain';
			} else {
				type = "file";
				mime_type = Mime.getType(fn);
			}
			size = _stat.size;
		} else {
			type = "directory";
			mime_type = null;
			size = null;
		}
		return ({
			content: null,
			created: _stat.ctime,
			last_modified: _stat.mtime,
			format: null,
			mimetype: mime_type,
			type: type,
			path: path,
			size: size,
			name: Path.basename(path),
			file_path: fn,
			writable: ( _stat.mode & 0o200 ) ? true: false,
			stat: _stat
		});
	}
	load(checkpoint) {
		let content;
		let type;
		let mime_type;

		if ( this.stat.isFile() ) {
			let checkpoint_dir;
			let path;
			if (( typeof checkpoint === 'undefined' ) ||
				( !checkpoint )) {
				path = this.file_path;
				this.stat = Fs.statSync(path);
			} else {
				checkpoint_dir = `${Path.dirname(this.file_path)}/.ipynb_checkpoints`;
				path = `${checkpoint_dir}/${Path.basename(this.file_path, '.ipynb')}-checkpoint.ipynb`;
				try {
					this.stat = Fs.statSync(path);
				}
				catch {
					path = this.file_path;
					this.stat = Fs.statSync(path);
				}
			}
			this.size = this.size;
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
					this.mime_type = 'text/plain';
				} else
				if ( this.file_path.match(/.md$/) ) {
					this.type = 'markdown';
					this.mime_type = 'text/plain';
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
		let stat;
		
		if (( typeof checkpoint === 'undefined' ) ||
			( !checkpoint )) {
			path = this.file_path;
		} else {
			checkpoint_dir = `${Path.dirname(this.file_path)}/.ipynb_checkpoints`;
			try {
				stat = Fs.statSync(checkpoint_dir);
			}
			catch {
				Fs.mkdirSync(checkpoint_dir);
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
		stat = Fs.statSync(path);

		this.stat = stat;
		this.size = stat.size;
		this.last_modified = stat.mtime;
		this.writable = ( stat.mode & 0o200 ) ? true: false;

		return ({
			content: null,
			created: stat.created,
			last_modified: stat.mtime,
			path: this.path,
			size: stat.size,
			writable: ( stat.mode & 0o200 ) ? true: false,
		});
	}
	rename(new_path) {
		let dir = make_path(BASE_DIR, this.user);
		let new_file_path = make_path(dir, new_path);
		
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
