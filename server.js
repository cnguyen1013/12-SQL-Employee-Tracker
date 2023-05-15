const mysql = require("mysql2");
const inquirer = require("inquirer");
require('dotenv').config();
require('console.table');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: process.env.DB_PASSWORD,
        database: 'employee_manager_db',
    },
    console.log(`Connected to the employee_manager_db database`)
);

db.connect(function (err) {
    if (err) throw err;
    options();
})

function options() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to do?',
            name: 'employeeTracker',
            choices: [
                'View All Employees',
                'Add Employee',
                'Update Employee Role',
                'View Employees by Manager',
                'View Employees by Department',
                'View All Roles',
                'Add Role',
                'View All Departments',
                'Add Department',
                'Quit',
            ]
        }
    ])
    .then((answer) => {
        if (answer.employeeTracker === "View All Employees") {
            viewAllemployees();
        } else if (answer.employeeTracker === "Add Employee") {
            addEmployee();
        } else if (answer.employeeTracker === "Update Employee Role") {
            updateEmployeerole();
        } else if (answer.employeeTracker === "View Employees by Manager") {
            viewEmploymanager();
        } else if (answer.employeeTracker === "View Employees by Department") {
            viewEmploydepartment();
        } else if (answer.employeeTracker === "View All Roles") {
            viewAllroles();
        } else if (answer.employeeTracker === "Add Role") {
            addRole();
        } else if (answer.employeeTracker === "View All Departments") {
            viewAlldepartments();
        } else if (answer.employeeTracker === "Add Department") {
            addDepartment();
        } else if (answer.employeeTracker === "Quit") {
            quit();
        }
    })
}

// View all Employees
function viewAllemployees() {
    const sql = `SELECT 
                    e.id,
                    e.first_name,
                    e.last_name,
                    r.title,
                    d.name AS department,
                    r.salary,
                    CONCAT(m.first_name, ' ', m.last_name) AS manager
                FROM 
                    employee AS e
                    INNER JOIN role AS r ON e.role_id = r.id
                    INNER JOIN department AS d ON r.department_id = d.id
                    LEFT JOIN employee AS m ON e.manager_id = m.id;`
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        options();
    });
}

// Add Employee
function addEmployee() {
    const sql = `SELECT r.id, r.title, CONCAT(e.first_name, ' ', e.last_name) AS employee_name
                FROM employee e
                JOIN role r ON e.role_id = r.id`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        const roles = results.map((row) => ({id: row.id, title: row.title}));
        const employeeNames = results.map((row) => ({ id: row.id, name: row.employee_name }));
        
        employeeNames.unshift({ id: null, name: "None" });

        inquirer.prompt([
            {
                type: 'input',
                name: 'first_name',
                message: "What is the employee`s first name?",
            },
            {
                type: 'input',
                name: 'last_name',
                message: "What is the employee's last name?",
            },
            {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles.map((role) => role.title),
            },
            {
                type: 'list',
                name: 'manager',
                message: "Who is the employee's manager?",
                choices: employeeNames.map((employee) => employee.name),
            }
        ])
        .then((answer) => {
            const role = roles.find((role) => role.title === answer.role);
            const roleId = role ? role.id : null;

            const manager = employeeNames.find((role) => role.name === answer.manager);
            const managerId = manager ? manager.id : null;

            const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;

            const params = [
                answer.first_name,
                answer.last_name,
                roleId,
                managerId
            ];

            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`Added '${answer.first_name} ${answer.last_name}' to the database.`);
                options();
            });
        });
    });
}

// Update Employee Role
function updateEmployeerole() {
    const sql = `SELECT r.id, r.title, CONCAT(e.first_name, ' ', e.last_name) AS employee_name, e.first_name, e.last_name
                FROM employee e
                JOIN role r ON e.role_id = r.id`;
    db.query(sql, (err, results) => {
        if (err) throw err;
        const roles = Array.from(new Set(results.map((row) => ({ id: row.id, title: row.title }))));
        const employeeNames = results.map((row) => ({
            id: row.id,
            name: row.employee_name,
            first_name: row.first_name,
            last_name: row.last_name
        }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'name',
                message: "Which employee's role do you want to update?",
                choices: employeeNames.map((employee) => ({
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.name
                }))
            },
            {
                type: 'list',
                name: 'role',
                message: "Which role do you want to assign the selected employee?",
                choices: roles.map((role) => role.title)
            }
        ])
        .then((answer) => {
            const role = roles.find((role) => role.title === answer.role);
            const roleId = role ? role.id : null;

            const selectedEmployee = employeeNames.find((employee) => employee.name === answer.name);

            const sql = `UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?`;
            const params = [roleId, selectedEmployee.first_name, selectedEmployee.last_name];

            db.query(sql, params, (err, res) => {
                if (err) throw err;
                console.log(`Updated role for employee '${selectedEmployee.first_name} ${selectedEmployee.last_name}'.`);
                options();
            });
        });
    });
}

// View Employees by Manager
function viewEmploymanager() {
    const sql = `SELECT CONCAT(m.first_name, ' ', m.last_name) AS manager, CONCAT(e.first_name, ' ', e.last_name) AS employee
                  FROM employee e
                  JOIN employee m ON e.manager_id = m.id
                  ORDER BY manager`;
    db.query(sql, (err, results) => {
        if (err) throw err;

        const employeesByManager = results.reduce((acc, row) => {
            const manager = row.manager;
            const employee = row.employee;

            if (!acc.hasOwnProperty(manager)) {
                acc[manager] = [employee];
            } else {
                acc[manager].push(employee);
            }

            return acc;
        }, {});

        const tableData = Object.entries(employeesByManager).map(([manager, employees]) => ({
            Employees: employees.join(', '),
            Manager: manager
        }));

        console.table(tableData);

        options();
    });
}

// View Employees by Department
function viewEmploydepartment() {
    const sql = `SELECT d.name AS department, CONCAT(e.first_name, ' ', e.last_name) AS employee
                FROM employee e
                JOIN role r ON e.role_id = r.id
                JOIN department d ON r.department_id = d.id
                ORDER BY department`;
    db.query(sql, (err, results) => {
        if (err) throw err;

        const employeesByDepartment = results.reduce((acc, row) => {
            const department = row.department;
            const employee = row.employee;

            if (!acc.hasOwnProperty(department)) {
                acc[department] = [employee];
            } else {
                acc[department].push(employee);
            }

            return acc;
        }, {});

        const tableData = Object.entries(employeesByDepartment).map(([department, employees]) => ({
            Employees: employees.join(', '),
            Department: department
        }));

        console.table(tableData);

        options();
    });
}

// View all Roles
function viewAllroles() {
    const sql = `SELECT
                    r.id,
                    r.title,
                    d.name AS department,
                    r.salary
                FROM
                    role AS r
                    JOIN department AS d ON r.department_id = d.id;`
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        options();
    });
}

// Add Role
function addRole() {

    const sql = 'SELECT id, name FROM department';
    db.query(sql, (err, departments) => {
        if (err) throw err;

        const departmentChoices = departments.map((department) => ({
            name: department.name,
            value: department.id,
        }))

        inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'What is the name of the role?'
            },
            {
                type: 'input',
                name: 'salary',
                message: 'What is the salary of the role?'
            },
            {
                type: 'list',
                name: 'department',
                message: 'Which department does the role belong to?',
                choices: departmentChoices,
            }
        ])
            .then((answer) => {
                const sql = 'INSERT INTO role SET ?';
                const roleData = {
                    title: answer.name,
                    salary: answer.salary,
                    department_id: answer.department,
                };

                db.query(sql, roleData, (err, res) => {
                    if (err) throw err;
                    console.log(`Added '${answer.name}' to the database`);
                    options();
                });
            });
    });
}

// View all Departments
function viewAlldepartments() {
    const sql = `SELECT
                    id,
                    name
                FROM department`
    db.query(sql, (err, res) => {
        if (err) throw err;
        console.table(res);
        options();
    });
}

// Add Department
function addDepartment() {

    inquirer.prompt([
        {
            type: 'input', 
            name: 'name',
            message: 'What is the name of the department?',
            choices: ''
        }
    ])
    .then((answer) => {
        const sql = `INSERT INTO department SET ?`
        db.query(sql, {name: answer.name}, (err, res) => {
            if (err) throw err;
            console.log(`Added '${answer.name}' to the database`);
            options();
        });
    })
}

// Quit
function quit() {
    console.log('Goodbye!');
    process.exit();
}