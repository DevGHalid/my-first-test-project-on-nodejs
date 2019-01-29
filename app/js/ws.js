window.addEventListener("load", function() {
    const ws = new WebSocket("ws://localhost:8081");
    const wrapper = document.querySelector(".wrapper");
    const row = document.querySelector(".row");
    const wrapperLoader = createStartPage();
    const btnStart = wrapperLoader.querySelector(".wrapper-loader__btnStart");
    const set = { default: "../" };

    // Открываем соединения
    ws.addEventListener("open", () => {
        console.log("Соединились ws");
    })

    // Закрываем сервер или произошла ошибка
    ws.addEventListener("close", function(event) {
        const CODE = event.code;
        const REASON = event.reason;

        if (event.WasClean) {
            console.log("Закрытие успешное");
        }
        else {
            console.error("Error: " + CODE + " " + REASON);
        }
    });

    // Получаем ответ от сервера
    ws.addEventListener("message", response => {
        if (typeof response === "object") {
            // Создаем список
            row.appendChild(
                createListFiles(JSON.parse(response.data).dataFileChild)
            );
        }
        // Отправляем ответ на сервер
        sendOnServer();
    })

    function sendOnServer() {
        // Получам ul.list-folder__row для того чтобы сохранить ответ от сервера в список
        const listFolderItems = document.querySelector(".list-folder__row");
        // Проверяем ul.list-folder__row если у него сосед
        if (listFolderItems.nextElementSibling === null) {
            // Проходимя по списку
            Array.from(listFolderItems.children).forEach(function(list) {
                // При нажатии мы отправляем на сервер какую папку открыть
                list.addEventListener("click", function() {
                    set.default += this.querySelector(".list-folder__itemsText").innerText + "/";
                    сheckingSend(ws);
                })
            });
        } else {
            // Проверяем на длину списка
            // если больше 0 то тогда папка не пустая
            // если 0 то папку пустая
            if (listFolderItems.nextElementSibling.children.length > 0) {
                listFolderItems.nextElementSibling.children
                // Проходимя по списку
                Array.from(listFolderItems.nextElementSibling.children).forEach(function(list) {
                    // При нажатии мы отправляем на сервер какую папку открыть
                    list.addEventListener("click", function() {
                        set.default += this.querySelector(".list-folder__itemsText").innerText + "/";
                        сheckingSend(ws);
                    })
                });
            } else {
                // Создаем список для того чтобы показать пользователю что папка пустая
                const listFolderItemNext = listFolderItems.nextElementSibling;
                listFolderItemNext.classList.add("empty");
                listFolderItemNext.innerHTML = "<li class='empty-folder'>Пустая папка</li>";
                
                // Убераю скрол
                if (listFolderItemNext.classList.contains("empty")) {
                    row.style.overflowY = "hidden";
                } else {
                    row.style.overflowY = "visible";
                }
            }

            row.removeChild(listFolderItems);
        }
    }

    function сheckingSend(clien) {
        // Проверяем соединились мы WebSocket
        if (ws.readyState === WebSocket.OPEN) {
            clien.send(JSON.stringify(set));
        } else {
            console.error("Ответ не пришел что-то произошло");
        }
    }

    // Error
    ws.addEventListener("error", function(err) {
        console.error("Error" + err.message);
    });

    wrapper.appendChild(wrapperLoader);

    btnStart.addEventListener("click", function() {
        wrapper.removeChild(wrapperLoader);
        ws.send(JSON.stringify(set));
    });

})

