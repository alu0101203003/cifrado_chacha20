
// --------------- Funciones principales ----------------- \\

function generar (){
var datos = get_datos();
var clave = datos.clave;
var contador = datos.contador;
var nonce = datos.nonce;

var estados = chacha20(clave,contador,nonce);
var EstadoInicial = estados.E1;
var Estado20 = estados.E2;
var EstadoSalida = estados.E3;

imprimirEstados(EstadoInicial,Estado20,EstadoSalida)

}

// --------------------------------------------------------- \\

function get_datos (){

    claveRaw = document.getElementById("clave").value;
    contadorRaw = document.getElementById("contador").value;      
    nonceRaw = document.getElementById("nonce").value;
    
    var clave = ToLittleEndian(claveRaw)
    var contador = ToLittleEndian(contadorRaw)
    var nonce = ToLittleEndian(nonceRaw)

	var datos = {
		clave: clave,
		contador: contador,
        nonce: nonce
	};
	return datos;
}

function ROTL (a,b){
    var array = new Uint32Array([a,b])
    return ( array[0] << array[1] | array[0] >>> (32-array[1]))
}

function QR (a,b,c,d){
    var array = new Uint32Array([a,b,c,d]);
    array[0] = a;
    array[1] = b;
    array[2] = c;
    array[3] = d;

    array[0] = array[0] + array[1]; array[3] = array[3] ^ array[0]; array[3] = ROTL(array[3], 16);

    array[2] = array[2] + array[3]; array[1] = array[1] ^ array[2]; array[1] = ROTL(array[1], 12);

    array[0] = array[0] + array[1]; array[3] = array[3] ^ array[0]; array[3] = ROTL(array[3], 8);

    array[2] = array[2] + array[3]; array[1] = array[1] ^ array[2]; array[1] = ROTL(array[1], 7);

    return [array[0],array[1],array[2],array[3]]
}

function ToLittleEndian(conjuntoPalabras){
    var palabras = conjuntoPalabras.split(": ");
    var pareja = []
    var aux = [];
    for (var i = 0; i < palabras.length; i++) {
      pareja = palabras[i].split(":");
      for (var j = 0; j < pareja.length; j++) {
          aux[j] = parseInt(pareja[j], 16);
      }
      aux.reverse();
      for (var j = 0; j < aux.length; j++) {
          if (aux[j].toString(16).length < 2) {
              pareja[j] = "0" + aux[j].toString(16);
          }
          else {
              pareja[j] = aux[j].toString(16);
          }
      }
      palabras[i] = pareja.join("");
  }
  return palabras;
}

function chacha20 (clave, contador, nonce) {
    var S = [];
    const EstadoInicial = [];
    const Estado20 = [];
    const EstadoSalida = [];

    S[0] = "61707865";  S[1] = "3320646e";
    S[2] = "79622d32";  S[3] = "6b206574";

    for (var i = 0; i < (clave.length); i++) {
        S[i+4] = clave[i];
    }

    S[12] = contador[0];

    for (var i = 0; i < (nonce.length); i++) {
        S[i + 13] = nonce[i];
    }

    for (var i = 0; i < S.length; i++) {
        EstadoInicial[i] = S[i];
    }

    for (let i = 0; i < 20; i += 2) {

        // Odd round (Column Round -> C )

        const C0 = QR(parseInt(S[0], 16), parseInt(S[4], 16), parseInt(S[8], 16), parseInt(S[12], 16));
        const C1 = QR(parseInt(S[1], 16), parseInt(S[5], 16), parseInt(S[9], 16), parseInt(S[13], 16)); 
        const C2 = QR(parseInt(S[2], 16), parseInt(S[6], 16), parseInt(S[10], 16), parseInt(S[14], 16));
        const C3 = QR(parseInt(S[3], 16), parseInt(S[7], 16), parseInt(S[11], 16), parseInt(S[15], 16));

        S[0] = C0[0].toString(16);  S[4] = C0[1].toString(16); 
        S[8] = C0[2].toString(16);  S[12] = C0[3].toString(16);

        S[1] = C1[0].toString(16);  S[5] = C1[1].toString(16);
        S[9] = C1[2].toString(16);  S[13] = C1[3].toString(16);
        
        S[2] = C2[0].toString(16);  S[6] = C2[1].toString(16);
        S[10] = C2[2].toString(16); S[14] = C2[3].toString(16);
         
        S[3] = C3[0].toString(16);  S[7] = C3[1].toString(16);
        S[11] = C3[2].toString(16); S[15] = C3[3].toString(16);

        // Even round (Diagonal Round -> D )

        const D0 = QR(parseInt(S[0], 16), parseInt(S[5], 16), parseInt(S[10], 16), parseInt(S[15], 16)); 
        const D1 = QR(parseInt(S[1], 16), parseInt(S[6], 16), parseInt(S[11], 16), parseInt(S[12], 16));
        const D2 = QR(parseInt(S[2], 16), parseInt(S[7], 16), parseInt(S[8], 16), parseInt(S[13], 16));
        const D3 = QR(parseInt(S[3], 16), parseInt(S[4], 16), parseInt(S[9], 16), parseInt(S[14], 16));

        S[0] = D0[0].toString(16);  S[5] = D0[1].toString(16);
        S[10] = D0[2].toString(16); S[15] = D0[3].toString(16);
        
        S[1] = D1[0].toString(16);  S[6] = D1[1].toString(16);
        S[11] = D1[2].toString(16); S[12] = D1[3].toString(16);
         
        S[2] = D2[0].toString(16);  S[7] = D2[1].toString(16);
        S[8] = D2[2].toString(16);  S[13] = D2[3].toString(16);
         
        S[3] = D3[0].toString(16);  S[4] = D3[1].toString(16);
        S[9] = D3[2].toString(16);  S[14] = D3[3].toString(16);
    }

    for (var i = 0; i < S.length; i++) {
        Estado20[i] = S[i];
    }

    for (let i = 0; i < S.length; i++) {
        var aux = parseInt(S[i], 16) + parseInt(EstadoInicial[i], 16);
        EstadoSalida[i] = aux.toString(16);
    if (EstadoSalida[i].length > 8) {
        EstadoSalida[i] = EstadoSalida[i].slice(1, EstadoSalida[i].length);
    }
  }

  var estados = {
    E1: EstadoInicial,
    E2: Estado20,
    E3: EstadoSalida
  };

return estados;
}

function imprimirEstados(E1,E2,E3){
    var inicio = "";
    var e20 = "";
    var salida = "";

    for (var i = 0; i < E1.length; i += 4) {
        inicio = inicio + `${E1[i]}  ${E1[i + 1]}  ${E1[i + 2]}  ${E1[i + 3]}<br>`;
        e20 = e20 + `${E2[i]}  ${E2[i + 1]}  ${E2[i + 2]}  ${E2[i + 3]}<br>`;
        salida = salida + `${E3[i]}  ${E3[i + 1]}  ${E3[i + 2]}  ${E3[i + 3]}<br>`;
    }

    document.getElementById("EstadoInicial").innerHTML = inicio;
    document.getElementById("Estado20").innerHTML = e20;
    document.getElementById("EstadoSalida").innerHTML = salida;

    // Show / Hide
    var mostrar = document.getElementById("estados");
    if (mostrar.style.display === "none") {
      mostrar.style.display = "block";
    } else {
      mostrar.style.display = "none";
    }
}




