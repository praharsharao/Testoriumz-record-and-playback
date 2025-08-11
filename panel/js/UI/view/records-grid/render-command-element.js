const renderCommandElement = (testCommand) => {
    // create tr node
    const new_record = document.createElement("tr");
    new_record.setAttribute("class", "");
    new_record.setAttribute("style", "");

    // create td node
    for (let i = 0; i < 4; ++i) {
        const td = document.createElement("td");
        const div_show = document.createElement("div");
        const div_hidden = document.createElement("div");
        div_show.style = "overflow:hidden;height:15px;";
        div_hidden.style = "display:none;";

        const img = document.createElement("img");
        img.src = "icons/close-command.svg";

        if (i > 0) {
            if (i === 1) {
                div_hidden.appendChild(document.createTextNode(testCommand.name));
            } else if (i === 2) {
                // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
                div_hidden.appendChild(document.createTextNode(testCommand.defaultTarget));
            } else if (i == 3) {
                div_show.style = "display:flex";
                div_show.classList.add("value");
                div_hidden.appendChild(document.createTextNode(testCommand.value));

            }
            td.appendChild(div_hidden);
            td.appendChild(div_show);
        }

        new_record.appendChild(td);
    }

    // append datalist to target
    const targets = document.createElement("datalist");
    for (const target of testCommand.targets) {
        const option = document.createElement("option");
        // use textNode to avoid tac's tag problem (textNode's content will be pure text, does not be parsed as html)
        option.appendChild(document.createTextNode(target));
        option.text = target;
        targets.appendChild(option);
    }
    new_record.getElementsByTagName("td")[2].appendChild(targets);
    return new_record;
}

export { renderCommandElement }