import { createNewTour } from "./custom-bootstrap-tour.js";

function makeid(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const displayTipPanel = async (panelDescription, buttonMessage ) => {
  await new Promise(resolve => {
    setTimeout(resolve, 500)
  });
  buttonMessage = buttonMessage === undefined ? "Got it" : buttonMessage;
  const template = `<div class='popover tour' style="color: black!important; z-index: 9">
      <div class='arrow'></div>
      <h3 class='popover-title'></h3>
      <div class='popover-content'></div>
      <div class='popover-navigation' style="text-align: center">
        <button class='btn btn-default' class="btn-end" data-role='end' style="float: none">${buttonMessage}</button>
      </div>
    </div>`;
  let option = {
    name: makeid(5),
    backdrop: false,
    storage: false,
    debug: false,
    delay: 0,
    template: template,
    steps: [panelDescription]
  };
  let tour = createNewTour(option);
  tour.setOnBeforeNext(() => {
  });
  tour.setOnBeforePrev(() => {
  });
  tour.init();
  tour.start();
}

export { displayTipPanel }