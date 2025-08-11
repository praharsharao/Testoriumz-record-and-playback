import {
    generateDropdownCommandToolbarCommand,
    generateEditCommandToolbarCommand,
    generateEditTargetToolbarCommand
} from "../../services/records-grid-service/command-generators.js";
import { resetFocus } from "../../services/records-grid-service/state-actions.js";
import { removeDirtyMarks } from "../../view/testcase-grid/remove-dirty-mark.js";
import { saveData } from "../../services/data-service/save-data.js";
import { getSelectedRecord } from "../../view/records-grid/selected-records.js";

function saveWhenInsideInput(event) {
    //capture Ctrl+S when inside input
    let keyNum;
    if (window.event) { // IE
        keyNum = event.keyCode;
    } else if (event.which) { // Netscape/Firefox/Opera
        keyNum = event.which;
    }
    if (event.ctrlKey || event.metaKey) {
        if (keyNum === 83 || keyNum === 229) {
            //disable browser default Ctrl + S event handler
            event.preventDefault();
            event.stopPropagation();
            const element = event.target;
            $(element).blur();
            saveData();
            removeDirtyMarks();
            resetFocus();
        }
    }
}

$(function() {
    // $("#command-command").on('input change', () => {
    //     console.log('check')
    //     $("#command-dropdown").addClass('w3-show');
    //     if ($('#command-dropdown option:visible').hasClass('checked') == false) {
    //         $('#command-dropdown option:visible').first().addClass('checked');
    //     }

    //     var filter = $('#command-command').val();
    //     if (filter !== '' || filter !== null) {;
    //         let $dropdown = $('#command-dropdown'),
    //             matcher = new RegExp(filter, 'i');

    //         $dropdown.children().hide().filter(function() {
    //             return matcher.test($(this).text())
    //         }).show();
    //     }
    // });

    // $("#command-command").on('keyup', (e) => {
    //     let options = $('#command-dropdown option:visible'),
    //         curr = $('#command-dropdown option:visible.checked'),
    //         currLength = curr.length,
    //         visibleLength = options.length,
    //         currIndex = options.index(curr[currLength - 1]);
    //     if (curr.is(':visible')) {
    //         if (e.which == 40 || e.keyCode == 40) {
    //             if (currIndex + 1 == visibleLength) {
    //                 $(options[0]).addClass('checked');
    //                 $(curr[currLength - 1]).removeClass('checked');
    //             } else {
    //                 $(curr[currLength - 1]).removeClass('checked')
    //                 $(options[currIndex + 1]).addClass('checked');
    //             }
    //         } else if (e.which == 38 || e.keyCode == 38) {
    //             if (currIndex == 0) {
    //                 $(options[visibleLength - 1]).addClass('checked');
    //                 $(curr[currLength - 1]).removeClass('checked');
    //             } else {
    //                 $(curr[currLength - 1]).removeClass('checked');
    //                 $(options[currIndex - 1]).addClass('checked');
    //             }
    //         }
    //         $("#command-dropdown").scrollTop(0);
    //         let scollNum = $(curr[currLength - 1]).offset().top - $("#command-dropdown").height() * 2.8;
    //         $("#command-dropdown").scrollTop(scollNum);
    //         if (e.which == 13 || e.keyCode == 13) {
    //             document.getElementById("command-command").value = curr[0].text;
    //             generateDropdownCommandToolbarCommand().execute();
    //             $("#command-dropdown").removeClass('w3-show');
    //             $("#command-command").trigger("input", curr[0].text);
    //         }
    //     }
    // });


    // $("#command-command").on("focusin", function(e) {
    //         let ID = getSelectedRecord();
    //         $(this).data('oldVal', $(this).val());
    //         $(this).data('ID', ID);
    //     }).on("focusout", function(e) {
    //         let oldVal = $(this).data('oldVal');
    //         if (oldVal !== $(this).val()) {
    //             generateEditCommandToolbarCommand("command-command").execute();
    //         }
    //     })
    //     .on("keydown", saveWhenInsideInput);

    // $("#command-value").on("focusin", function() {
    //     let ID = getSelectedRecord();
    //     $(this).data('oldVal', $(this).val());
    //     $(this).data('ID', ID);
    // }).on("focusout", function() {
    //     let oldVal = $(this).data('oldVal');
    //     if (oldVal !== $(this).val()) {
    //         generateEditCommandToolbarCommand("command-value").execute();
    //     }
    // }).on("keydown", saveWhenInsideInput);


    // $("#command-target").on("focusin", function() {
    //     let ID = getSelectedRecord();
    //     $(this).data('oldVal', $(this).val());
    //     $(this).data('ID', ID);
    // }).on("focusout", function() {
    //     if ($("#target-dropdown").hasClass("w3-show")) {
    //         $("#target-dropdown").removeClass('w3-show');
    //     }

    //     let oldValue = $(this).data("oldVal");
    //     generateEditTargetToolbarCommand(oldValue).execute();
    // });


    // $("#command-dropdown").click(function(e) {
    //     let option = e.target;
    //     if (option.nodeName === "OPTION") {
    //         document.getElementById("command-command").value = option.text;
    //         generateDropdownCommandToolbarCommand().execute();
    //         $("#command-dropdown").removeClass('w3-show');
    //         $("#command-command").trigger("input", option.text);
    //     }
    // });

    // $("#command-dropdown").mouseover(function(e) {
    //     if ($(this).find('option:visible').hasClass('checked') == true) {
    //         $(this).find('option:visible.checked').removeClass('checked');
    //     }
    //     $(this).find('option:hover').addClass('checked');
    // });

    // $("#command-dropdown").mouseleave(function(e) {
    //     $("#command-dropdown").removeClass('w3-show');
    //     $('#command-dropdown option').removeClass('checked');
    // });

    // $("#target-dropdown").click(function(e) {
    //     let option = e.target;
    //     if (option.nodeName === "OPTION") {
    //         generateDropdownCommandToolbarCommand().execute();
    //     }
    // })

    // $("#command-").click(function(e) {
    //     if ($("#target-dropdown").hasClass("w3-show")) {
    //         $("#target-dropdown").removeClass('w3-show');
    //     }
    // });
    // $("#target-").click(function(e) {
    //     if ($("#command-dropdown").hasClass("w3-show")) {
    //         $("#command-dropdown").removeClass('w3-show');
    //     }
    // })
});

// $(document).click(function(e) {
//     if ((e.target.id && e.target.id !== 'command-command') ||
//         (e.target.parentElement.id && e.target.parentElement.id !== 'command-dropdown')) {
//         $("#command-dropdown").removeClass('w3-show');
//     }

//     if ((e.target.id && e.target.id !== 'command-target') ||
//         (e.target.parentElement.id && e.target.parentElement.id !== 'target-dropdown')) {
//         $("#target-dropdown").removeClass('w3-show');
//     }

//     if (!e.target.id) {
//         $("#command-dropdown").removeClass('w3-show');
//         $("#target-dropdown").removeClass('w3-show');
//     }
// });