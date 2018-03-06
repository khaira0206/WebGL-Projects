// Sierpinski triangle.
// Vertex shader program
// Harmanjot Singh ,9/14/2016
// The program draws the points on the canvas and generate a shape drawing triangle within tringle recursively.
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + // attribute variable
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 1.0;\n' +
  '}\n'; 

// Fragment shader program
var FSHADER_SOURCE = 
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +

  '}\n';
var gl;  
function main() {
  // Retrieve <canvas> element
var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
   gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
// Get the storage location of a_Position
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

//Initail point 
var Px=0.0;
var Py=0.0;

//x coordinate values of the triangle
var Vx =[0.0,0.5,-0.5];
//x coordinate values of the triangle
var Vy =[0.5,-0.5,-0.5];


for(var i=0 ; i<40000; i++)
{
	// Generating random number among 1,2,3. 
	//Which will be used as index of the point array Vx and Vy to
	//select the vertices of tringle randomly
	var ran= Math.floor(Math.random() * 3);
	
	Px = (Px + Vx[ran])/2;
	Py = (Py + Vy[ran])/2;
	
  // Pass vertex position to attribute variable
  gl.vertexAttrib3f(a_Position, Px, Py, 0.0);
  
  // call to the render function to draw the point
  render();	
}
  
};
function render()
{
  // Draw
  gl.drawArrays(gl.POINTS, 0, 1);
  
}