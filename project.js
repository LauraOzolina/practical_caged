import * as THREE from './three.js-dev/build/three.module.js';
import { MTLLoader } from './three.js-dev/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from './three.js-dev/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from './three.js-dev/examples/jsm/controls/OrbitControls.js';

import { VRButton } from './three.js-dev/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from './three.js-dev/examples/jsm/webxr/XRControllerModelFactory.js';


export function project() {

    let object;
    var scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    var user = new THREE.Group();
    user.position.set(0, 0, 0);
    scene.add(user);
    user.add(camera);
    const loader = new THREE.TextureLoader();
    let renderer = new THREE.WebGLRenderer();
    let textureLoader = new THREE.TextureLoader();

    renderer.xr.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    let container;

    let controller1, controller2;
    let controllerGrip1, controllerGrip2;

    let raycaster;

    const intersected = [];
    const tempMatrix = new THREE.Matrix4();

    let controls, group;
    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();

    controllerGrip1 = renderer.xr.getControllerGrip(0);
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    scene.add(controllerGrip1);

    controllerGrip2 = renderer.xr.getControllerGrip(1);
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    scene.add(controllerGrip2);

    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
    line.name = 'line';
    line.scale.z = 5;

    controller1.add(line.clone());
    controller2.add(line.clone());

    raycaster = new THREE.Raycaster();

    function onSelectStart(event) {

        const controller = event.target;

        const intersections = getIntersections(controller);

        if (intersections.length > 0) {

            const intersection = intersections[0];

            const object = intersection.object;
            object.material.emissive.b = 1;
            controller.attach(object);

            controller.userData.selected = object;
            
         
        }

    }

    function onSelectEnd(event) {

        const controller = event.target;

        if (controller.userData.selected !== undefined) {

            const object = controller.userData.selected;
            object.material.emissive.b = 0;
            group.attach(object);
            controller.userData.selected.visible = false;
            controller.userData.selected = undefined;
console.log('shoot');
        }


    }

    function getIntersections(controller) {

        tempMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

        return raycaster.intersectObjects(group.children);

    }

    function intersectObjects(controller) {

        // Do not highlight when already selected

        if (controller.userData.selected !== undefined) return;

        const line = controller.getObjectByName('line');
        const intersections = getIntersections(controller);

        if (intersections.length > 0) {

            const intersection = intersections[0];

            const object = intersection.object;
            object.material.emissive.r = 1;
            intersected.push(object);
         
            line.scale.z = intersection.distance;

        } else {

            line.scale.z = 5;

        }

    }

    function cleanIntersected() {

        while (intersected.length) {

            const object = intersected.pop();
            object.material.emissive.r = 0;

        }

    }

    var orbitcontrols = new OrbitControls(camera, renderer.domElement);
    var moonPivot;


    let mesh_arr = [];
    let mesh_arr_shade = [];
    camera.position.z = 10;
    group = new THREE.Group();
    create_boxes();
    scene.add(group);
    //templis
  
    //koki
    //create_obj('./materials.mtl', './model.obj', 0, 20, -35, 6, 1);
    //pamats
    create_plane();

    const color = 0xFFFFFF;  // white
    const near = 0;
    const far = 100;
    //scene.fog = new THREE.Fog(color, near, far);
    const bgTexture = loader.load('./cage.jpg');
    scene.background = bgTexture;
    const amb = new THREE.AmbientLight(0xfeebff, 0.2);
    scene.add(amb);
    renderer.setAnimationLoop(function () {
        moonPivot.rotation.x += 0.007;
     
        mesh_arr.forEach(function (mesh) {
            mesh.translateY(-0.1);
            mesh.translateX(-0.001);
            mesh.rotation.y += Math.PI / 180;
            var position = new THREE.Vector3();
            position.setFromMatrixPosition(mesh.matrixWorld);

            if (position.y < 0) {

                mesh.position.y = 40;
            }
        })

        mesh_arr_shade.forEach(function (mesh) {

            mesh.rotation.y += Math.PI / 180;


        })
        cleanIntersected();

        intersectObjects(controller1);
        intersectObjects(controller2);
        renderer.render(scene, camera);
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(VRButton.createButton(renderer));
    document.body.appendChild(renderer.domElement);



    function create_obj(m, o, x, y, z, s, mm) {
        var mtlLoader = new MTLLoader();
        mtlLoader.load(m, function (materials) {
            materials.preload();
            var objloader = new OBJLoader();
            objloader.setMaterials(materials);
            objloader.load(o, function (mesh) {

                if (mm) {
                    let cloned;
                    let mesh_arr = [];

                    for (let this_y = 0; this_y < 30; this_y++) {
                        cloned = mesh.clone();
                        mesh.scale.set(s, s, s);
                        //random koku pozicijas
                        if (this_y % 2 == 0) {
                            var xloc = Math.floor(Math.random() * (1 + 40 - (10))) + (10);
                        }
                        else {
                            var xloc = Math.floor(Math.random() * (1 + (-40) - (-10))) + (-10);
                        }

                        var zloc = Math.floor(Math.random() * (1 + 40 - (-31)) + (-31));
                        cloned.position.set(xloc, y, zloc);
                        mesh_arr.push(cloned)

                        scene.add(cloned);

                    }

                }
                else {
                    mesh.scale.set(s, s, s);
                    mesh.position.set(x, y, z);
                    mesh.rotation.set(0, 0, 0);

                    scene.add(mesh);
                }

            })
        })

    }
    //function for ground
    function create_plane() {
        const geometry = new THREE.PlaneGeometry(200, 200, 32);
        const material = new THREE.MeshStandardMaterial({
            map: loader.load('./cardboard.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.offset.set(0, 0);
                texture.repeat.set(4, 4);

                // your code

            }),
            side: THREE.DoubleSide,


        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.set(89.55, 0, 0);

        const moon = new THREE.PointLight(0xff1100, 1);
        moon.position.set(0, 180, 0);
        moonPivot = new THREE.Group();
        plane.add(moonPivot);
        moonPivot.add(moon);

        scene.add(plane);
    }

    function create_leaves() {
        //custom  geometry
        let this_shape_arr = [];
        this_shape_arr.push(new THREE.Vector2(0, 0));
        this_shape_arr.push(new THREE.Vector2(5, 5));
        this_shape_arr.push(new THREE.Vector2(10, 0));
        this_shape_arr.push(new THREE.Vector2(10, -5));
        this_shape_arr.push(new THREE.Vector2(5, -10));
        this_shape_arr.push(new THREE.Vector2(0, -5));
        for (let i_counter = 0; i_counter < this_shape_arr.length; ++i_counter) {
            this_shape_arr[i_counter].multiplyScalar(0.15);
        }
        const this_shape = new THREE.Shape(this_shape_arr);
        const this_shape_geometry = new THREE.ShapeBufferGeometry(this_shape);
        const material = new THREE.MeshPhongMaterial({
            color: 0xffaa17,
            side: THREE.DoubleSide,
        });
        const this_object = new THREE.Mesh(this_shape_geometry, material);
        let mesh;

        for (let this_y = -80; this_y < 80; this_y++) {
            mesh = this_object.clone();
            var xloc = Math.floor(Math.random() * (1 + (40) - (-40))) + (-40);


            var zloc = Math.floor(Math.random() * (1 + 40 - (-31)) + (-31));
            mesh.position.set(xloc, this_y * Math.random(), zloc);

            mesh_arr.push(mesh)
            scene.add(mesh);

        }
    }

    function create_shader_obj() {

        const material1 = new THREE.ShaderMaterial({
            uniforms: uniform,
            vertexShader: document.getElementById("vertexShader").textContent,
            fragmentShader: document.getElementById("fragmentShader").textContent
        })

        const geometry = new THREE.BoxGeometry(5, 5, 5);

        const cube1 = new THREE.Mesh(geometry, material1);

        cube1.rotation.z = 95;
        let mesh;
        let mesh2;
        let cc = -90;
        for (let this_y = -10; this_y < 0; this_y++) {
            mesh = cube1.clone();
            mesh2 = cube1.clone();
            mesh.position.set(60, 10, cc);
            mesh2.position.set(-60, 10, cc);
            cc += 20;
            mesh_arr_shade.push(mesh)
            mesh_arr_shade.push(mesh2)

            scene.add(mesh);
            scene.add(mesh2);
        }
    }

    function create_boxes() {
        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshStandardMaterial({
            map: loader.load('./leo.jpg', function (texture) {


            }),



        });
        const box = new THREE.Mesh(geometry, material);
        let cc = -60;
        let bb = 10;
        let mesh;
        for (let this_y = -10; this_y < 0; this_y++) {
            mesh = box.clone();

            mesh.position.set(cc, 2, -10);
            if (bb == 10) {
                bb = -5;
            }
            else {
                bb = 10;
            }
            cc += 10;

            group.add(mesh);
        }

    }

}



