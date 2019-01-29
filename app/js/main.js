function createListFiles(fs) {
    const ul = document.createElement("ul");
    ul.className = "list-folder__row";

    fs.forEach(e => {
        ul.innerHTML += `
            <li class="list-folder__items folder">
                <i class="fas fa-folder"></i>
                <div class="list-folder__itemsText">${e}</div>
            </li>
        `;
    });

    return ul;
}

function createStartPage() {
    const div = document.createElement("div");
    const divChild = document.createElement("div");
    const button = document.createElement("button");

    div.className = "wrapper-loader";
    divChild.className = "wrapper-loader__row";
    button.className = "wrapper-loader__btnStart";

    button.innerText = 'Начать работать с файлами';

    div.appendChild(divChild);
    divChild.appendChild(button);

    return div;
}