module.exports =  {
	kernels_dir: `${process.env.HOME}/.ipython/kernels`,
	home: process.env.HOME,
	data_dir: `${process.env.HOME}/jupyter`,
	host: '127.0.0.1',
	shell_port: 0,
	stdin_port: 0,
	control_port: 0,
	iopub_port: 0,
	heartbeat_port: 0,
	session_ttl: 3600 * 24 * 7,
	session_path: './sessions',
	password_path: './password',
};
