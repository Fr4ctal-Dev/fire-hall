$(document).ready(function () {
    members = JSON.parse(members)
    for (const membersKey in members) {
        members[membersKey].date_of_birth = members[membersKey].date_of_birth.split('T')[0]
        members[membersKey].date_of_joining = members[membersKey].date_of_joining.split('T')[0]
    }
    $('#view-members-table').dataTable({
        data: members,
        columns: [
            { data: "last_name" },
            { data: 'first_name' },
            { data: 'date_of_birth' },
            { data: 'date_of_joining' },
            { data: 'task' },

        ]
    });
})

