import * as three from 'three';


function doit() {
    let scene = new three.Scene();
    let camera = new three.PerspectiveCamera(75, 
                              window.innerWidth / window.innerHeight, 
                              0.1, 1000);

    let render = new three.WebGLRenderer();
    render.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);

    let ball = new three.BoxGeometry(10, 10, 10);
    let material = new three.MeshBasicMaterial({color: 0x00ff00, fog: true, opacity: 0.8});
    let ball_mesh = new three.Mesh(ball, material);

    scene.add(ball_mesh);
    camera.position.z = 50;

    document.body.appendChild(render.domElement);

    function animate() {
        requestAnimationFrame(animate);
        render.render(scene, camera);
    }
    animate();
}


console.log("hello three");
doit();

