const mysql = require("mysql2");
const inquirer = require("inquirer");
require('dotenv').config();

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
            console.log("Hello World");
        } else if (answer.employeeTracker === "Add Employee") {
            console.log("Hello World1");
        } else if (answer.employeeTracker === "Update Employee Role") {
            console.log("Hello World2");
        } else if (answer.employeeTracker === "View All Roles") {
            console.log("Hello World3");
        } else if (answer.employeeTracker === "Add Role") {
            console.log("Hello World4");
        } else if (answer.employeeTracker === "View All Departments") {
            console.log("Hello World5");
        } else if (answer.employeeTracker === "Add Department") {
            console.log("Hello World6");
        } else if (answer.employeeTracker === "Quit") {
            console.log("Hello World7");
        }
    })
}