//Keys of users.
let keys = ["id", "name", "email"];

// Get data from the server
function getServerData(url) {
    let fetchOptions = {
        method: "GET",
        mode: "cors",
        cache: "no-cache"
    };

    return fetch(url, fetchOptions).then(
        response => response.json(),
        err => console.error(err)
    );
}

function startGetUsers() {
    getServerData("http://localhost:3000/users").then(
        data => fillDataTable(data, "userTable")
    );
}

document.querySelector("#geteDataBtn").addEventListener("click", startGetUsers);

// Fill table with data
function fillDataTable(data, tableID) {
    let table = document.querySelector(`#${tableID}`);
    if (!table) {
        console.error(`Table "${tableId}" is not found. `);
        return;
    }

    //meghívom az új bevitelő mezőket gyártó függvényt    

    let tBody = table.querySelector("tbody");
    tBody.innerHTML = '';
    let newRow = newUserRow();
    tBody.appendChild(newRow);

    for (let row of data) {
        //elemgyártó függvénnyel létrehozom a trt, attribútum nélkül így a ciklus egyszer sem fog lefutni
        let tr = createAnyElement("tr");
        //belső ciklussal bejárom a row objektumot kulcs-érték párral: row objektumon belül bejárom és létrrehozom a cellákat: td-ket attribútum nélkül
        //majd td innerhtmljét beállítom a rowr kulcsára aztán a tr-t hozzáadom a tdhez, majd a tr-t hozzáadom a táblázat bodyjához 
        /*    for (let k of keys) {
               let td = createAnyElement("td");
               if (k == "id") {
                   let input = createAnyElement("input", {
                       class: "form-control",
                       value: row[k],
                       readonly: true
                   });
                   td.appendChild(input);                
               } else {
                   let input = createAnyElement("input", {
                       class: "form-control",
                       value: row[k],
               });
               td.appendChild(input);
           }
               tr.appendChild(td);
       } */

        for (let k of keys) {
            let td = createAnyElement("td");
            let input = createAnyElement("input", {
                class: "form-control",
                value: row[k],
                name: k
            });
            if (k == "id") {
                input.setAttribute("readonly", true);
            }
            td.appendChild(input);
            tr.appendChild(td);
        }
        //itt híom meg a gombcsoportos új függvényt (let btnGroup=új fv) majd hozzáadom a tr-hez (tr.appendChild(btnGroup)) hogy betegye a sorok végére
        let btnGroup = createBtnGroup();
        tr.appendChild(btnGroup);
        tBody.appendChild(tr);
    }
}


// Hogy felgyorsítsam a dolgot létrehozok egy függvényt amivel bármilyen elemet létre tudok később hozni
function createAnyElement(name, attributes) {
    let element = document.createElement(name);
    // ezzel létrehoztam megfelelő névvel egy elemet, utána for ciklussal végig megyek az attribútumokon
    for (let k in attributes) {
        element.setAttribute(k, attributes[k]);
        //az új elem neve legyen a kulcs, értéke a kulcs értéke
    }
    return element;
    //végül visszaadom az elemet
}

//Gombokat helyezek el a sorok végén: egy fügvény segítségével:létrehozok egy gombcsoportot
//létrehozok egy group-ot ami egy div aminek a class attribútumát beállítom btn btn-group-ra
//majd létrehozom a gombokat btn btn-info és btn btn-danger class-ra 
//ezeket hozzáadom a grouphoz
// létrehozok egy cellát amihez hozzáadom a groupot majd visszaadom azt (td-t)
//végül a tBody for ciklusában meghívom a függvényt és hozzáadom a trt
function createBtnGroup() {
    let group = createAnyElement("div", { class: "btn btn-group" });

    let infoBtn = createAnyElement("button", { class: "btn btn-info", onclick: "setRow(this)" });
    infoBtn.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i>';
    let delBtn = createAnyElement("button", { class: "btn btn-danger", onclick: "delRow(this)" });
    delBtn.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';

    group.appendChild(infoBtn);
    group.appendChild(delBtn);

    let td = createAnyElement("td");
    td.appendChild(group);
    return td;
}

//törlés függvényét megcsináljuk: 1. táblázat gombjához attribútumként adtunk egy onclick eseményt, amikor lefut a delRow() onclick:"delRow()"
//function delRow() {
//logolok egy thist - ez a window lesz ezért a gombnál adom meg a thist amit átad a függvényemnek: onclick:"delRow(this), function delRow(btn) { - így már ha loglom a btn = a gomb"
function delRow(btn) {
    let tr = btn.parentElement.parentElement.parentElement;
    //így már meg van az egész sor de nekem csak a sorszám kell ami az ID
    let id = tr.querySelector("td:first-child").innerHTML;
    //így logolva kiírja az IDket, jöhet a fetch
    let fetchOptions = {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache"
    };

    //elindítom a fetchet a szerverre -> linket template stringként írom hog y a végére betegye az IDt
    fetch(`http://localhost:3000/users/${id}`, fetchOptions).then(
        resp => resp.json(),
        err => console.error(err)
    ).then(
        data => {
            startGetUsers();
        }
    );
}

//létrehozok egy első sort a táblázat tejejére amibe bel elehet vinni új adatokat

function newUserRow(row) {
    let tr = createAnyElement("tr");
    for (let k of keys) {
        let td = createAnyElement("td");
        let input = createAnyElement("input", {
            class: "form-control",
            name: k
        });
        td.appendChild(input);
        tr.appendChild(td);
    }
    let newBtn = createAnyElement("button", {
        class: "btn btn-success",
        onclick: "createUser(this)"
    });
    newBtn.innerHTML = '<i class="fa fa-plus-circle" aria-hidden="true"></i>';
    let td = createAnyElement("td");
    td.appendChild(newBtn);
    tr.appendChild(td);

    return tr;
}

//új user elmentése a gombra: gomb szülői közül a tr-t kiválasztom -> megkeresem benne az összes inputot
//->kiolvasom az adatokat és az input nevével ellátva kulcs-érték párokat készítek egy objektumba -> ezt fogom elküldeni a szervernek h ezzel hozza létre az új sort
function createUser(btn) {
    let tr = btn.parentElement.parentElement;
    let data = getRowData(tr);
    delete data.id;
    let fetchOptions = {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(`http://localhost:3000/users`, fetchOptions).then(
        resp => resp.json(),
        err => console.error(err)
    ).then(
        data => startGetUsers()
    );
}

function getRowData(tr) {
    let inputs = tr.querySelectorAll("input.form-control");
    let data = {};
    for (let i = 0; i < inputs.length; i++) {
        data[inputs[i].name] = inputs[i].value;
    }
    return data;
}

//PUT metódussal érti a json szerver hogy adatot akarok módosítani

function setRow(btn) {
    let tr = btn.parentElement.parentElement.parentElement;
    let data = getRowData(tr);
    let fetchOptions = {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        headers: {
            "Content-Type": "applcation/json"
        },
        body: JSON.stringify(data)
    };

    fetch(`http://localhost:3000/users/${data.id}`, fetchOptions).then(
        resp => resp.json(),
        err => console.error(err)
    ).then(
        data => startGetUsers()
    );
}




