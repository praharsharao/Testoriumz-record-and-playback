import { genCommandDatalist } from "../../view/command-toolbar/generate-command-data-list.js";

$(document).ready(function() {
  $(".tablesorter").tablesorter();

  $("#options").click(function() {
    browser.runtime.openOptionsPage();
  });

  //init dropdown width
  // $("#command-dropdown").css({
  //   'width': $("#command-command").outerWidth() + "px"
  // });
  // $("#target-dropdown").css({
  //   'width': $("#command-target").outerWidth() + "px"
  // });
  //dropdown width change with input's width
  $(window).resize(function() {
    // $("#command-dropdown").css({
    //   'width': $("#command-command").outerWidth() + "px"
    // });
    $("#records-grid").find(".target-dropdown").css({
      'width': $("#records-grid").find(".command-target").width() + 20
    });
  });
  //dropdown when click the down icon
  $(".fa-chevron-down").click(function(e) {
    e.stopPropagation();
    dropdown($("#" + $(this).attr("id") + "dropdown"));
  });

  $("#command-grid").colResizable({ liveDrag: true, minWidth: 75, resizeMode:'fix' });

  $("#command-dropdown,#command-command-list").html(genCommandDatalist());
  
  // Set Robot Framework as default command set
  window.loadRobotFrameworkCommands = true;
  
  // Regenerate command datalist with Robot Framework commands
  $("#command-dropdown,#command-command-list").html(genCommandDatalist());
  
  // Force refresh the command input field to show Robot Framework commands
  if (typeof inputCommand === 'function') {
    inputCommand(document.getElementById("command-command"));
  }
  
  // Add Robot Framework command toggle
  const commandToggleHtml = `
    <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;">
      <label style="font-weight: bold; margin-right: 10px;">Command Set:</label>
      <button id="katalon-commands" class="command-set-btn" style="margin-right: 5px; padding: 5px 10px; border: 1px solid #ccc; border-radius: 3px; background: #6c757d; color: white;">Katalon</button>
      <button id="robot-commands" class="command-set-btn active" style="padding: 5px 10px; border: 1px solid #ccc; border-radius: 3px; background: #007bff; color: white;">Robot Framework</button>
    </div>
  `;
  
  // Insert the toggle after the command dropdown
  $("#command-dropdown").after(commandToggleHtml);
  
  // Handle command set switching
  $("#katalon-commands").click(function() {
    $(".command-set-btn").removeClass("active").css("background", "#6c757d");
    $(this).addClass("active").css("background", "#007bff");
    window.loadRobotFrameworkCommands = false;
    $("#command-dropdown,#command-command-list").html(genCommandDatalist());
  });
  
  $("#robot-commands").click(function() {
    $(".command-set-btn").removeClass("active").css("background", "#6c757d");
    $(this).addClass("active").css("background", "#007bff");
    window.loadRobotFrameworkCommands = true;
    $("#command-dropdown,#command-command-list").html(genCommandDatalist());
    
    // Force refresh the command input field
    if (typeof inputCommand === 'function') {
      inputCommand(document.getElementById("command-command"));
    }
  });

  // Set Robot Framework as default when recording starts
  $(document).on('recordingStarted', function() {
    window.loadRobotFrameworkCommands = true;
    $("#robot-commands").click();
  });

  $(".record-bottom").click(function() {
    $(this).addClass("active");
    $('#records-grid .selectedRecord').removeClass('selectedRecord');
  });

  $("#slider").slider({
    min: 0,
    max: 3000,
    value: 0,
    step: 600
  }).slider("pips", {
    rest: "label", labels: ["Fast", "", "", "", "", "Slow"]
  });

});

var dropdown = function(node) {
  if (!node.hasClass("w3-show")) {
    node.addClass("w3-show");
    setTimeout(function() {
      $(document).on("click", clickWhenDropdownHandler);
    }, 200);
  } else {
    $(".w3-show").off("mouseleave");
    node.removeClass("w3-show");
    $(document).off("click", clickWhenDropdownHandler);
  }
};

var clickWhenDropdownHandler = function(e) {
  if (e.target.tagName === "TD" || e.target.tagName === "OPTION") {
    let parent = e.target.parentElement;
    while (parent.id !== "command-dropdown" && parent.id !== "target-dropdown") {
      parent = parent.parentElement;
    }
    $(parent).prev().prev().val(e.target.innerHTML).trigger("input");
    dropdown($(".w3-show"));
  }
};

