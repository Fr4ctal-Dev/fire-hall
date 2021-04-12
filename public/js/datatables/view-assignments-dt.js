$(document).ready(function () {
    assignments = JSON.parse(assignments)
    for (const assignmentsKey in assignments) {
        assignments[assignmentsKey].date_created = assignments[assignmentsKey].date_created.split('T')[0]
    }

    $('#view-members-table').dataTable({
        data: assignments,
        columns: [
            { data: "type" },
            { data: 'date_created' },
            { data: 'description' },
            { data: 'address' },


        ]
    });
})
