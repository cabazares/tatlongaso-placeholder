// standard global variables
var container, scene, camera, renderer, controls, stats;

var shape;
var projector;
var ray;

var XSIZE = 300;
var YSIZE = 300;

function init() {
    // scene
    scene = new THREE.Scene();
    // camera
    var VIEW_ANGLE = 45, ASPECT = XSIZE / YSIZE, NEAR = -200, FAR = 1000;
    camera = new THREE.OrthographicCamera(-200, 200, 200, -200, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, 1000);
    camera.lookAt(scene.position);

    // renderer
    renderer = new THREE.SVGRenderer();
    renderer.setSize(XSIZE, YSIZE);
    container = document.createElement('div');
    container.id = "triangleCanvas";
    container.style.position = "absolute";
    container.style.width = XSIZE + "px";
    container.style.height = YSIZE + "px";
    document.body.appendChild(container);
    container.appendChild(renderer.domElement);

    // controls
    controls = new THREE.TrackballControls(camera);
    controls.noPan = true;
    controls.panSpeed = 0;

    // Using wireframe materials to illustrate shape details.
    var wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        wireframeLinewidth: 20
    });

    // tetrahedron
    var geometry = new THREE.TetrahedronGeometry(150, 0);
    shape = new THREE.Mesh(geometry, wireframeMaterial);
    shape.position.set(0, 0, 0);
    shape.rotation.set(Math.PI/2, Math.PI/4, Math.PI/4);
    shape.matrix.setRotationFromEuler(shape.rotation);
    scene.add(shape);

    // initialize object to perform world/screen calculations
    projector = new THREE.Projector();
    ray = new THREE.Ray(camera.position, null);
}

function animate() {
    requestAnimationFrame( animate );
    render();
    update();
}

function update() {
    // move
    if (shape) {
        rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationX(.01);
        rotationMatrix.makeRotationY(.01);
        rotationMatrix.makeRotationZ(.01);
        // Update the object's rotation & apply it
        rotationMatrix.multiplySelf(shape.matrix);
        shape.rotation.getRotationFromMatrix(rotationMatrix);
    }

    var mouse3D = projector.unprojectVector(new THREE.Vector3(0, 0, 0),
                                            camera);
    ray.direction = mouse3D.subSelf(camera.position).normalize();
    controls.update();
}

function render() {
    renderer.render(scene, camera);
}

var logoOrigWidth = 1642;
var logoRatio = logoOrigWidth / 626;
var logoRatioInv = (1 / logoRatio);
var fit = 0.8;
var logoText = null;
var triangle = null;

$(window).resize(function () {

    logoText = (logoText !== null)? logoText : $('#logoText');
    triangle = (triangle !== null)? triangle : $(triangleCanvas);

    var win = $(this);
    var winWidth = win.width();
    var winHeight = win.height();

    var landscape = winWidth >= winHeight;
    var logoWidth, logoHeight;
    if (landscape && (winHeight * fit) >= winWidth) {
        logoHeight = winHeight * fit;
        logoWidth = logoRatio * logoHeight;
    } else {
        logoWidth = winWidth * fit;
        logoHeight = (1 / logoRatio) * logoWidth;
    };

    // size
    logoText.height(logoHeight);
    logoText.width(logoWidth);

    // position
    logoText.css({'margin-left': logoWidth / -2,
                  'margin-top': logoHeight / -2});

    // triangle scale
    var scale = (logoWidth / logoOrigWidth);
    var roundScale = 1 / parseFloat(scale.toString().substring(0,4));
    camera.scale.set(roundScale, roundScale, roundScale);
    shape.material.wireframeLinewidth = 15 * scale;

    // triangle position
    var pos = logoText.offset();
    triangle.css({'left': pos.left, 'top': pos.top,
                  'margin-left': (0.18 * logoWidth) - (XSIZE / 2),
                  'margin-top': (0.3 * logoHeight) - (YSIZE / 2)});
});
