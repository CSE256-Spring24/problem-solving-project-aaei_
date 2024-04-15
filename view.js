// ---- Define your dialogs  and panels here ----

const additionalInfo = {
    "Read": "Allows users to read and view file contents and properties.",
    "Write": "Allow user to write on a file, changing contents.",
    "Read_Execute": "Users can read and execute an application.",
    "Modify": "Users can read, write, and delete the file.",
    "Full_control": "Users have full access, including changing permissions and file ownership.",
    "Special_permissions": "Users have custom configured permissions beyond the standard."

};
const rules = {
    "Inheritance":"Files and folders inherit permissions from the folders they are in. Users inherit permissions from groups they are in. Inherited properties are blocked in gray. ",
    "Precedence":"Directly granted permissions override inherited permissions. Deny overrides allow at the same level, but not if deny was inherited",
    "Permissions Hierarchy":"Deny permissions override allow permissions",
    "User Hierarchy":"There exists several types of groups and users. For instance, admin is at the top of the hierarchy and has access and permissions to everything. This does include all the users, TAs and other types of users you will come accross on the website. There are also different groups. For instance, employees is a group of specific employees, not necessarily all."
}

const examples = {
    "1": "If a user's permissions are different from their group, they need to be <strong>ADDED</strong> and directly edited to override inherited permissions", 
    "2": "If a user has an 'allow' for one action on a file but 'deny' for the same action in the folder it's in, they are allowed the action",
    "3": "<strong>DENYING</strong> full control removes all permissions for a user so they cannot access or make changes",
    "4": "If a manager is granted a role that contains a specific permission, but a <strong>deny</strong> policy says that the manager cannot use that permission, then the manager cannot use the permission."
}

let permInfo = '<div id = "perm_info"><strong style="font-size: 25px; margin-bottom: 5px;">Permission Information</strong><ul style = "padding-left: 40px;">';

for (const [permission, description] of Object.entries(additionalInfo)) {
    permInfo += `<li style="margin-bottom: 5px;"><strong>${permission}:</strong> ${description}</li>`;
}

let genRule = '<div id = "gen_Rule"><strong style="font-size: 25px; margin-bottom: 5px;">General Rules</strong><ul style = "padding-left: 40px;">';

for (const [rule, instruction] of Object.entries(rules)) {
    genRule += `<li style="margin-bottom: 5px;"><strong>${rule}:</strong> ${instruction}</li>`;
}

let exam = '<div id = "example"><strong style="font-size: 25px; margin-bottom: 5px;">Examples</strong><ul style = "padding-left: 40px;">';

for (const [count, ex] of Object.entries(examples)) {
    exam += `<li style="margin-bottom: 5px;"><strong>${count}:</strong> ${ex}</li>`;
}

permInfo += '</ul></div>';
genRule += '</ul></div>';
exam += '</ul></div>';
// $('#sidepanel').append(permInfo)
// $('#sidepanel').append(genRule)
// $('#sidepanel').append(exam)

// following a different tutorial, hope this works
let accordionContent = '<div id="accordion">';
accordionContent += '<h3>Permission Information, General Rules, and Examples</h3>';
accordionContent += '<div>';
accordionContent += permInfo;
accordionContent += genRule;
accordionContent += exam;
accordionContent += '</div>'; // closes the section of the accordion
accordionContent += '</div>'; // closes container for accordion
$('#sidepanel').append(accordionContent);

// Initialize the accordion
$(function () {
    $("#accordion").accordion({
        collapsible: true,
        active: false
    });
});

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').append('Edit Permissions')
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 