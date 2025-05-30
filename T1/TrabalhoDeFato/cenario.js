import * as THREE from "three";

const material = new THREE.MeshBasicMaterial({ color: 'rgb(37, 72, 45)' });
const planeMaterial = new THREE.MeshStandardMaterial({ color: 'rgb(58, 7, 7)' });
const boxMaterial   = new THREE.MeshStandardMaterial({ color: 'rgb(155, 77, 77)' });
const planeGeometry = new THREE.PlaneGeometry(500, 500); 
const boxGeometry1 = new THREE.BoxGeometry(10, 30, 100);
const boxGeometry2 = new THREE.BoxGeometry(30, 30, 70);
const boxGeometry3 = new THREE.BoxGeometry(60, 30, 100);
const boxGeometry4 = new THREE.BoxGeometry(40, 30, 100);
const boxGeometry5 = new THREE.BoxGeometry(30, 30, 70);
const boxGeometry6 = new THREE.BoxGeometry(30, 30, 100);
const boxGeometry7 = new THREE.BoxGeometry(135, 30, 100);
const boxGeometry8 = new THREE.BoxGeometry(30, 30, 70);
const rampGeometry = new THREE.PlaneGeometry(30, Math.sqrt(30 * 30 + 30 * 30));
const rampMaterial = new THREE.MeshStandardMaterial({ visible: false }); 
const wallGeometry = new THREE.PlaneGeometry(500, 50);
const wallMaterial  = new THREE.MeshStandardMaterial({ color: 'rgb(255, 255, 255)' });

const chao = []; // array para armazenar os objetos do chão
const paredes = []; // array para armazenar as paredes

function inicializaCenario(scene) {
    // Cria o chão
    const ground = new THREE.Mesh(planeGeometry, material);
    ground.position.set(0, 0, 0); // posiciona o chão no centro da cena
    ground.rotation.x = -0.5 * Math.PI; // rotaciona para ficar horizontal
    chao.push(ground); // adiciona o chão ao array de chão

    // Cria as escadas
    const escada = new THREE.Group();

    const degraus = 8;
    const largura = 30;
    const alturaTotal = 30;
    const comprimento = 30;
    
    const alturaDegrau = alturaTotal / degraus;
    const profundidadeDegrau = comprimento / degraus;
    
    for (let i = 0; i < degraus; i++) {
      const geometry = new THREE.BoxGeometry(largura, alturaDegrau, profundidadeDegrau);
      const degrau = new THREE.Mesh(geometry, planeMaterial); 
      
      degrau.position.x = 0;
      degrau.position.y = (i + 0.5) * alturaDegrau;
      degrau.position.z = (i + 0.5) * profundidadeDegrau;
      
      escada.add(degrau);
    }

    //box 1
    const box11 = new THREE.Mesh(boxGeometry1, boxMaterial);
    box11.position.set(-195, 15, -150);
    chao.push(box11);
    paredes.push(box11);
    
    const box12 = new THREE.Mesh(boxGeometry2, boxMaterial);
    box12.position.set(-175, 15, -165);
    chao.push(box12);
    paredes.push(box12);
    
    const box13 = new THREE.Mesh(boxGeometry3, boxMaterial);
    box13.position.set(-130, 15, -150);
    chao.push(box13);
    paredes.push(box13);
    
    const escada1 = escada.clone();
    escada1.position.set(-175, 0, -100);
    escada1.rotation.y = Math.PI; 
    
    //box 2
    const box21 = new THREE.Mesh(boxGeometry3, boxMaterial);
    box21.position.set(-20, 15, -150);
    chao.push(box21);
    paredes.push(box21);
    
    const box22 = new THREE.Mesh(boxGeometry2, boxMaterial);
    box22.position.set(25, 15, -165);
    chao.push(box22);
    paredes.push(box22);
    
    const box23 = new THREE.Mesh(boxGeometry1, boxMaterial);
    box23.position.set(45, 15, -150);
    chao.push(box23);
    paredes.push(box23);
    
    const escada2 = escada.clone();
    escada2.position.set(25, 0, -100);
    escada2.rotation.y = Math.PI; 
    
    //box 3
    const box31 = new THREE.Mesh(boxGeometry4, boxMaterial);
    box31.position.set(120, 15, -150);
    chao.push(box31);
    paredes.push(box31);
    
    const box32 = new THREE.Mesh(boxGeometry5, boxMaterial);
    box32.position.set(155, 15, -165);
    chao.push(box32);
    paredes.push(box32);
    
    const box33 = new THREE.Mesh(boxGeometry6, boxMaterial);
    box33.position.set(185, 15, -150);
    chao.push(box33);
    paredes.push(box33);
    
    const escada3 = escada.clone();
    escada3.position.set(155, 0, -100);
    escada3.rotation.y = Math.PI;
    
    //box4
    const box41 = new THREE.Mesh(boxGeometry7, boxMaterial);
    box41.position.set(-82.5, 15, 150);
    chao.push(box41);
    paredes.push(box41);
    
    const box42 = new THREE.Mesh(boxGeometry8, boxMaterial);
    box42.position.set(0, 15, 165);
    chao.push(box42);
    paredes.push(box42);
    
    const box43 = new THREE.Mesh(boxGeometry7, boxMaterial);
    box43.position.set(82.5, 15, 150);
    chao.push(box43);
    paredes.push(box43);
    
    const escada4 = escada.clone();
    escada4.position.set(0, 0, 100);
    
    // Cria as rampas
    const ramp1 = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp1.rotation.x = -Math.atan(30 / 30);
    ramp1.position.set(-175, 15, -115);
    chao.push(ramp1);

    const ramp2 = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp2.rotation.x = -Math.atan(30 / 30); 
    ramp2.position.set(25, 15, -115);
    chao.push(ramp2);

    const ramp3 = new THREE.Mesh(rampGeometry, rampMaterial);
    ramp3.rotation.x = -Math.atan(30 / 30); 
    ramp3.position.set(155, 15, -115);
    chao.push(ramp3);

    const ramp4 = new THREE.Mesh(rampGeometry, wallMaterial);
    ramp4.rotation.y = Math.PI;
    ramp4.rotation.x = Math.atan(30 / 30);
    ramp4.position.set(0, 15, 115);
    chao.push(ramp4);

    //Cria as paredes
    const parede1 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede1.position.set(0, 25, -250);
    // parede1.rotation.x = 0; 
    paredes.push(parede1); 

    const parede2 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede2.position.set(0, 25, 250); 
    parede2.rotation.x = Math.PI;    
    paredes.push(parede2);

    const parede3 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede3.position.set(-250, 25, 0);
    parede3.rotation.y = Math.PI / 2;
    paredes.push(parede3); 

    const parede4 = new THREE.Mesh(wallGeometry, wallMaterial); 
    parede4.position.set(250, 25, 0); 
    parede4.rotation.y = Math.PI / -2;
    paredes.push(parede4);

    //Adiciona os objetos na cena
    scene.add(ground);
    scene.add(box11);
    scene.add(box12);
    scene.add(box13);
    scene.add(box21);
    scene.add(box22);
    scene.add(box23);
    scene.add(box31);
    scene.add(box32);
    scene.add(box33);
    scene.add(box41);
    scene.add(box42);
    scene.add(box43);
    scene.add(escada1);
    scene.add(escada2);
    scene.add(escada3);
    scene.add(escada4);
    scene.add(ramp1);
    scene.add(ramp2);
    scene.add(ramp3);
    scene.add(ramp4);
    scene.add(parede1);
    scene.add(parede2);    
    scene.add(parede3);
    scene.add(parede4);
}

//Só pra gente puxar os objetos para a colisão
function getParedes() {
    return paredes;
}

//Só pra gente puxar os objetos para a colisão
function getChao() {
    return chao;
}



export { inicializaCenario, getParedes, getChao };