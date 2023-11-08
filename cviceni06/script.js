// const { vec2, vec3, mat3, mat4 } = glMatrix;
window.onload = function () {
	var gl = document.getElementById("webgl_canvas").getContext("experimental-webgl");
	// 	var convertButton = document.getElementById("draw");


	// 	convertButton.addEventListener('click', function(){
	// 		make_globe(gl);
	// 	  });
	// }
	// function make_globe(gl){
	// Create vertex shader
	var vertexShaderCode = document.querySelector("#vs").textContent;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderCode);
	gl.compileShader(vertexShader);
	// Create fragment shader
	var fragmentShaderCode = document.querySelector("#fs").textContent;
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderCode);
	gl.compileShader(fragmentShader);

	// Create program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);
	// Create buffer for positions of vertices
	var posLoc = gl.getAttribLocation(program, "pos");
	gl.enableVertexAttribArray(posLoc);
	// Create buffer for position of vertices
	var posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
	// We need many vertices, because each vertex need
	// own value of normal and UV

	const sphere_div = 15//Number(document.getElementById("sphere_div").value);
	console.log(sphere_div)
	var vertices = [];
	var normals = [];
	for (let m = 0; m <= sphere_div; m++) {
		layer = Math.PI / 2 - m * Math.PI / sphere_div;
		z = Math.sin(layer);
		xy = Math.cos(layer);

		for (let n = 0; n <= sphere_div; n++) {
			point = n * 2* Math.PI / sphere_div;
			x = xy*Math.cos(point);
			y =xy* Math.sin(point);
			vertices.push(x)
			vertices.push(z)
			vertices.push(y)

			normals.push(x);
			normals.push(y);
			normals.push(z);
			
		}
	}
	console.log(vertices);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

	// Create buffer for UV coordinates
	var uvLoc = gl.getAttribLocation(program, "uv");
	gl.enableVertexAttribArray(uvLoc);
	var uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	uvs = []; //Tři body
	for (let m = 0; m <= sphere_div; m++) {
		for (let n = 0; n <= sphere_div; n++) {
			u = n / sphere_div;
			v = m / sphere_div;
			uvs.push(u);
			uvs.push(v);
		}
	}
	// for (let m = 0; m <= sphere_div; m += 2) {
	// 	for (let n = 0; n <= sphere_div; n += 2) {
	// 		point1_x = n / sphere_div;
	// 		point1_y = m / sphere_div;
	// 		point2_x = (n + 1) / sphere_div;
	// 		point2_y = m / sphere_div;
	// 		point3_x = n / sphere_div;
	// 		point3_y = (m + 1) / sphere_div;
	// 		point4_x = (n + 1) / sphere_div;
	// 		point4_y = (m + 1) / sphere_div;

	// 		uvs.push(point1_x, point1_y, point2_x, point2_y, point3_x, point3_y)
	// 		uvs.push(point2_x, point2_y, point3_x, point3_y, point4_x, point4_y)
	// 	}
	// }

	console.log(uvs)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
	gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0);

	// Create buffer for vertex normals
	var normalLoc = gl.getAttribLocation(program, "normal");
	gl.enableVertexAttribArray(normalLoc);
	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	// for (let m = 0; m <= sphere_div; m++) {
	// 	for (let n = 0; n <= sphere_div; n++) {
	// 		var theta = m * Math.PI / sphere_div;
	// 		var phi = n * 2 * Math.PI / sphere_div;

	// 		var x = Math.sin(theta) * Math.cos(phi);
	// 		var y = Math.sin(theta) * Math.sin(phi);
	// 		var z = Math.cos(theta);

			
	// 	}
	// }

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, true, 0, 0);

	// Create index buffer
	var indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	var indices = [];
	for (let m = 0; m <= sphere_div; m++) {
		for (let n = 0; n <= sphere_div; n++) {
			p1 = m * (sphere_div) + n
			p2 = (m + 1) * (sphere_div) + n

			indices.push(p1)
			indices.push(p1 + 1)
			indices.push(p2)

			indices.push(p2)
			indices.push(p1 + 1)
			indices.push(p2 + 1)
		}
	}
	console.log(indices)

	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

	// Create and load image used as texture
	var image = new Image();
	image.src = "./globe_texture.jpg";
	image.onload = function () {
		var texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		gl.generateMipmap(gl.TEXTURE_2D);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, texture);
		var samplerLoc = gl.getUniformLocation(program, "sampler");
		gl.uniform1i(samplerLoc, 0); // nula odpovídá gl.TEXTURE0
	};

	// Create matrix for model
	var modelMatrix = mat4.create();
	mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(0.8, 0.8, 0.8));
	var modelLocation = gl.getUniformLocation(program, "modelMatrix");
	gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

	// Create matrix for view
	var viewMatrix = mat4.create();
	mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(0, 0, -5));
	var viewLocation = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewLocation, false, viewMatrix);

	// Create matrix for projection
	var projMatrix = mat4.create();
	mat4.perspective(projMatrix, Math.PI / 3, 1, 0.1, 100);
	var projLocation = gl.getUniformLocation(program, "projMatrix");
	gl.uniformMatrix4fv(projLocation, false, projMatrix);

	// Create matrix for transformation of normal vectors
	var normalMatrix = mat3.create();
	var normalLocation = gl.getUniformLocation(program, "normalMatrix");
	mat3.normalFromMat4(normalMatrix, modelMatrix);
	gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

	// Enable depth test
	gl.enable(gl.DEPTH_TEST);

	// Create polyfill to make it working in the most modern browsers
	window.requestAnimationFrame = window.requestAnimationFrame
		|| window.mozRequestAnimationFrame
		|| window.webkitRequestAnimationFrame
		|| function (cb) { setTimeout(cb, 1000 / 60); };

	var render = function () {
		mat4.rotateX(modelMatrix, modelMatrix, 0.00);
		mat4.rotateY(modelMatrix, modelMatrix, 0.01);
		gl.uniformMatrix4fv(modelLocation, false, modelMatrix);

		mat3.normalFromMat4(normalMatrix, modelMatrix);
		gl.uniformMatrix3fv(normalLocation, false, normalMatrix);

		gl.clear(gl.COLOR_BUFFER_BIT, gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
		requestAnimationFrame(render);
	}

	render();
}