let cliente = {
    mesa:'',
    hora:'',
    pedido:[]
};

const categorias = {
    1: 'comida',
    2: 'bebida',
    3: 'postre'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Revisar si hay campos vacios
    const camposVacios = [mesa, hora].some( campo => campo === '');

    if(camposVacios){
        //verificar si ya hay una alerta
        const exiteAlerta = document.querySelector('.invalid-feedback');
        
        if(!exiteAlerta){
            const alerta = document.createElement('DIV');
        alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
        alerta.textContent = 'Todos los campos son obligatorios';
        document.querySelector('.modal-body form').appendChild(alerta); 

        setTimeout(() =>{
            alerta.remove();
        },3000)
        }

        return
    }
    
    //asignar datos del formulario al cliente
    cliente = {...cliente, mesa, hora}

    //ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide()

    //mostrar las secciones 
    mostrarSecciones();

    //obtener platillos de la API de JSON.Server
    obtenerPlatillos();
}

function mostrarSecciones() {
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));
}

function obtenerPlatillos(){
    const url = 'http://localhost:4000/platillos';

    fetch(url)
        .then( respuesta => respuesta.json())
        .then( resultado => mostrarPlatillos(resultado))
        //.catch(error => console.log(error)); //sirve para ver mejor los errores en la consola
}


function mostrarPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre= document.createElement('DIV');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias [ platillo.categoria ];

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //funcion qie detecta la cantidad i el platillo que se esta agregando
        inputCantidad.onchange = function (){
            const cantidad = parseInt (inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        };

        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad);

        
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar)

        contenido.appendChild(row);
    })
}

function agregarPlatillo(producto){
    //extraer el pedido actual
    let { pedido } = cliente ;
    //revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){
        
        //comprueba si el elemnento ya esxite en el array
        if(pedido.some ( articulo => articulo.id === producto.id)){
            //el articulo ya existe, actualizar la cantidad
            
            const pedidoActualizado = pedido.map(articulo =>{
                if(articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            //se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado]
        }else {
            //el articulo no exite, lo agregaremos al array de pedido
            cliente.pedido = [...pedido, producto];
        }

        
    } else {
        //eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter(articulo => articulo.id !== producto.id)
        cliente.pedido = resultado
        
    }
    //limpiar el codigo HTML previo
    limpiarHTML();

    if(cliente.pedido.length){
        //mostrar el resumen 
        actualizarResumen();
    }else {
        mensajePedidoVacio();
    }
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5', 'shadow');

    //informacion de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //informacion de la hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');
    hora.appendChild(horaSpan);

    //agregar a los elementos padres
    mesa.appendChild(mesaSpan)
    hora.appendChild(horaSpan)

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach( articulo => {
        const {nombre, cantidad, precio, id} = articulo;
    
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-4')
        nombreEl.textContent = nombre;

        //cantidad del articulo
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //precio del articulo
        const precioEl = document.createElement('P');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        //subtotal del articulo
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        //boton para eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        //funcion para eliminar el pedido
        btnEliminar.onclick = function( ){
            eliminarProducto(id)
        }

        //agregar valores a sus contenedores 
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        //agregar elementos al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);
        


        //agregar lista al grupo principal
        grupo.appendChild(lista);

    })

    //agregar al conteido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo)

    contenido.appendChild(resumen);

    //mostrar formulario de propinas
    formularioPropinas()
}

function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    return `$ ${precio *cantidad}`;

}

function eliminarProducto(id){
    const {pedido} = cliente
    const resultado = pedido.filter(articulo => articulo.id !== id)
    cliente.pedido = resultado
    console.log(cliente.pedido)

    //limpiar el codigo HTML previo
    limpiarHTML();

    //limpiar el codigo HTML previo
    limpiarHTML();
    if(cliente.pedido.length){
        //mostrar el resumen 
        actualizarResumen();
    }else {
        mensajePedidoVacio();
    }

    //el producto se elimino por lo tanto regresamos la cantidad a 0 en el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
    

}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido')

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto)
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card', 'py-5', 'px-3', 'shadow')

    const heading = document.createElement('H3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    //radio button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10)
    radio10Div.appendChild(radio10Label);

    //radio button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25)
    radio25Div.appendChild(radio25Label);


    //radio button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = ' 50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio50Div.appendChild(radio50)
    radio50Div.appendChild(radio50Label);

    //agregar al DIV principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //agregar al formulario
    formulario.appendChild(divFormulario);



    contenido.appendChild(formulario);
}


function  calcularPropina(){

    const {pedido} = cliente;
    let subtotal = 0;

    //calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    })

    //seleccionar el radio button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;


    //calcular la propina
    const propina = ((subtotal * parseInt(propinaSeleccionada, ))/100)

    //calcular el total a pagar

    const total = subtotal + propina;

    mostrarTotalHTML(subtotal, total, propina)
}

function mostrarTotalHTML(subtotal, total, propina){

    const divTotales = document.createElement('DIV');
    divTotales.classList.add('total-pagar');

    //subtotal
    const subtotalParrafo = document.createElement('P');
    subtotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subtotalParrafo.textContent = 'Subtotal Consumo: ';

    const subtotalSpan = document.createElement('SPAN');
    subtotalSpan.classList.add('fw-normal');
    subtotalSpan.textContent = `$${subtotal}`;
    subtotalParrafo.appendChild(subtotalSpan);

    // Propina
    const propinaParrafo = document.createElement('P');
    propinaParrafo.classList.add('fs-3', 'fw-bold');
    propinaParrafo.textContent = 'Propina: ';

    const propinaSpan = document.createElement('SPAN');
    propinaSpan.classList.add('fw-normal');
    propinaSpan.textContent = `$${propina}`;
    propinaParrafo.appendChild(propinaSpan);

    // Total
    const totalParrafo = document.createElement('P');
    totalParrafo.classList.add('fs-3', 'fw-bold');
    totalParrafo.textContent = 'Total a Pagar: ';

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total}`;

    totalParrafo.appendChild(totalSpan);

    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv) {
        totalPagarDiv.remove();
    }
   


    divTotales.appendChild(subtotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(divTotales)

}