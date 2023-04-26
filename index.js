
const GAME_AREA_LENGTH = 12;
const GAME_LEVEL = 30;
const BOOM_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABL0lEQVR4nO2WwUoDMRRFz6p1p2O7U3/O0m7UfoK1ftBgQereWYgbK9jl9B9af0AJ3EAQRl+ajLPphQtDyHsnyTxeAgfZ9Qq80IG+5NZVABNgAWwC8EZjY81J0glwAwyBPjAHPgNYk92cO8UMleM4BnytRGvg3QD86ZVi3fdVDHgQBKZ4rVxm9bXqVPAHcGTHwn0GqPfMCj1tKKRH4Aw4B5YR4J212icNCRzQ6yJy1yMLeNECuLSAw+YQeim4gz5FguvfgFXGgmpy1RX4eZ+jTnFt+ccPLYBLC3jcAvjS2kB2GaFb3XYmzTOCb61Qf0m8ZYC6HL0YcGfX4jQIXO25U79w9woxqxB8oGOfGQtuq3/aU+w0xzus0C1TqiF4WK2xUUz1psiD/13VX733IAJ9AzJbibhtZ2x+AAAAAElFTkSuQmCC"

var game_data = [];

const makeGameData = () => {
    for (let j = 1; j <= GAME_AREA_LENGTH; j++) {
        let line = [];
        for (let i = 1; i <= GAME_AREA_LENGTH; i++) {
            line.push({ x: j, y: i, boom: false, text: "" });
        }
        game_data.push(line);
    }
}

const getRableBoomIndex = () => {
    return Math.round(Math.floor(Math.random() * 10) * 1.2);
}

const makeBoomIndex = () => {
    let xIndex = getRableBoomIndex();
    let yIndex = getRableBoomIndex();
    return { x: xIndex, y: yIndex }
}

const insertBoomToData = () => {
    for (let i = 0; i < GAME_LEVEL; i++) {
        var boom = makeBoomIndex();
        while (game_data[boom.x][boom.y].boom) {
            boom = makeBoomIndex()
        }
        game_data[boom.x][boom.y].boom = true;
    }
}

const getRoundId = (cellId) => {
    var cellInfo = {
        x: Number(cellId.split('_')[0]),
        y: Number(cellId.split('_')[1]),
    }
    return [
        `${cellInfo.x - 1}_${cellInfo.y - 1}`,
        `${cellInfo.x - 1}_${cellInfo.y}`,
        `${cellInfo.x - 1}_${cellInfo.y + 1}`,
        `${cellInfo.x}_${cellInfo.y - 1}`,
        `${cellInfo.x}_${cellInfo.y + 1}`,
        `${cellInfo.x + 1}_${cellInfo.y - 1}`,
        `${cellInfo.x + 1}_${cellInfo.y}`,
        `${cellInfo.x + 1}_${cellInfo.y + 1}`,
    ]
}

const checkCellArea = (cellInfo) => {
    let check = [
        { x: cellInfo.x - 1, y: cellInfo.y - 1 },
        { x: cellInfo.x - 1, y: cellInfo.y },
        { x: cellInfo.x - 1, y: cellInfo.y + 1 },
        { x: cellInfo.x, y: cellInfo.y - 1 },
        { x: cellInfo.x, y: cellInfo.y + 1 },
        { x: cellInfo.x + 1, y: cellInfo.y - 1 },
        { x: cellInfo.x + 1, y: cellInfo.y },
        { x: cellInfo.x + 1, y: cellInfo.y + 1 }
    ]

    let count = 0;
    for (let checkItem of check) {
        let error = false;
        let boom = false
        try {
            boom = game_data[checkItem.x - 1][checkItem.y - 1].boom
        } catch (e) {
            error = true
        }
        if (!error && boom) {
            count += 1;
        }
    }
    return count;
}

const insertTextToData = () => {
    for (let row of game_data) {
        for (let col of row) {
            let count = checkCellArea(col)
            col.text = count == 0 ? "" : count;
        }
    }
}

const makeGameTable = () => {
    for (let row of game_data) {
        let tr = document.createElement('tr');
        for (let col of row) {
            let td = document.createElement('td');
            let cell = document.createElement('span');
            cell.className = 'cell init';
            cell.id = `${col.x}_${col.y}`
            if (col.boom) {
                let img = document.createElement('img');
                img.className = "disabled";
                img.src = BOOM_SRC;
                cell.append(img)
            } else {
                cell.innerHTML = `<span class="disabled">${col.text}</span>`;
            }
            td.append(cell);
            tr.append(td);
        }
        $('#table').append(tr);
    }
}

const init = () => {
    makeGameData();
    insertBoomToData();
    insertTextToData();
    makeGameTable();
    let time = setInterval(() => {
        if ($('.cell.init').length == GAME_LEVEL) {
            alert("You Win!");
            clearInterval(time);
        }
    }, 500);
    $('.cell').on('click', function () {
        if ($(this).hasClass('checked')) {
            return;
        }
        let span = $(this).children("span");
        let img = $(this).children("img");
        let id = $(this).attr("id");
        if (span.length > 0) {
            if (!span.hasClass('disabled')) {
                return;
            }
            span.removeClass("disabled");
            $(this).addClass("ok");
            $(this).removeClass("init");
            if (span.text() == "") {
                for (let idStr of getRoundId(id)) {
                    if ($('#' + idStr).length > 0) {
                        $('#' + idStr).click();
                    }
                }
            }
        }
        if (img.length > 0) {
            img.removeClass("disabled");
            $(this).addClass("error");
            alert("炸了");
            location.reload();
        }
    })
    $('.cell').on('contextmenu', function (event) {
        //処理
        event.preventDefault();
        if ($(this).hasClass('ok')) {
            return;
        }
        $(this).toggleClass('checked');
    });
}

init();